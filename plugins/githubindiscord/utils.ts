import { settings } from "replugged";
import { Octokit } from "@octokit/rest";
import { components, operations } from "@octokit/openapi-types";
import { useEffect, useState } from "react";
import { usePaginate } from "./paginate";

export type Branch = components["schemas"]["short-branch"] & {
  commit: components["schemas"]["commit"];
};

export interface RepoQuery {
  branches?: operations["repos/list-branches"]["parameters"]["query"];
  tags?: operations["repos/list-tags"]["parameters"]["query"];
  issues?: operations["issues/list"]["parameters"]["query"];
  prs?: operations["pulls/list"]["parameters"]["query"];
  branch?: string;
}

export type TreeWithContent = components["schemas"]["git-tree"]["tree"][0] & {
  filename: string;
  fileType?: string;
  tree?: TreeWithContent[];
  content?: string;
  latestCommit?: components["schemas"]["commit"];
};

export type Issue = components["schemas"]["issue-search-result-item"] & {
  pull?: components["schemas"]["pull-request"];
  timeline?: operations["issues/list-events-for-timeline"]["responses"]["200"]["content"]["application/json"];
  files?: operations["pulls/list-files"]["responses"]["200"]["content"]["application/json"];
  marked?: boolean;
};

export const pluginSettings = await settings.init("dev.eboi.githubindiscord");

const octokit = new Octokit({ auth: pluginSettings.get("key") });
const cache = new Map<
  string,
  {
    repo: components["schemas"]["full-repository"];
    tags: Array<components["schemas"]["tag"]>;
    tree: TreeWithContent[];
    branches: Branch[];
  }
>();

export async function getAll(url: string, query: RepoQuery, force?: boolean) {
  if (!force && cache.has(`${url}/${JSON.stringify(query)}`))
    return cache.get(`${url}/${JSON.stringify(query)}`)!;
  else if (force) cache.forEach((_, k) => k.includes(url) && cache.delete(k));
  const repo = await getRepo(url);
  const defaultBranch = await getBranch(url, repo.default_branch);
  const branches = (await getBranches(url, { ...query?.branches })).filter(
    (b) => b.name !== defaultBranch.name,
  );
  const selectedBranch = query?.branch && branches.find((b) => b.name === query.branch);
  const tags = await getTags(url, { ...query?.tags });
  const tree = await getFolder(url, (selectedBranch || defaultBranch).commit.sha, {
    recursive: "1",
    branch: (selectedBranch || defaultBranch).name,
  });

  const data = {
    repo,
    branches: [defaultBranch, ...branches],
    tags,
    tree,
  };

  cache.set(`${url}/${JSON.stringify(query)}`, data);
  // safe to assume that the default branch was fetched so cache
  if (!query.branch)
    cache.set(`${url}/${JSON.stringify({ ...query, branch: repo.default_branch })}`, data);

  return data;
}

export function useRepo({ url, query }: { url: string; query: RepoQuery }) {
  const [repo, setRepo] = useState<{
    repo: components["schemas"]["full-repository"];
    tags: Array<components["schemas"]["tag"]>;
    tree: TreeWithContent[];
    branches: Branch[];
  }>();
  const [status, setStatus] = useState<"loading" | "err" | "complete">("loading");
  const [error, setError] = useState<string>();
  const [iQuery, setQuery] = useState(query);
  const [force, setForce] = useState(false);
  const issues = usePaginate(
    octokit,
    { q: `repo:${url} is:issue` },
    {
      force,
      onError: (e) => {
        setStatus("err");
        setError(e);
      },
    },
  );
  const prs = usePaginate(
    octokit,
    { q: `repo:${url} is:pr` },
    {
      force,
      onError: (e) => {
        setStatus("err");
        setError(e);
      },
    },
  );

  useEffect(() => {
    setStatus("loading");
    (async () => {
      try {
        const r = await getAll(url, iQuery, force);
        setRepo(r);
        setForce(false);
        setStatus("complete");
      } catch (err) {
        // @ts-expect-error stfu
        setError(err.message as string);
        setStatus("err");
        console.error(err);
      }
    })();
  }, [JSON.stringify(iQuery), url, force]);

  const refetch = (q: RepoQuery, force?: boolean) => {
    if (!force && JSON.stringify(q) === JSON.stringify(iQuery)) return;
    setForce(Boolean(force));
    setQuery(q);
  };

  return { data: (repo && { ...repo, issues, prs }) || null, status, error, refetch };
}

export async function getBranches(
  url: string,
  query?: operations["repos/list-branches"]["parameters"]["query"],
) {
  const branches = await octokit.repos.listBranches({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    ...query,
  });
  return await Promise.all(
    branches.data.map(async (b) => ({ ...b, commit: await getCommit(url, b.name) })),
  );
}

export async function getBranch(url: string, branchName: string) {
  const branch = await octokit.repos.getBranch({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    branch: branchName,
  });
  return branch.data;
}

export async function getRepo(url: string) {
  const repo = await octokit.repos.get({ owner: url.split("/")[0]!, repo: url.split("/")[1] });
  return repo.data;
}

export async function getFolder(
  url: string,
  tree_sha: string,
  query?: operations["git/get-tree"]["parameters"]["query"] & { branch?: string },
) {
  const folder = await octokit.git.getTree({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    tree_sha,
    ...query,
  });
  return sortTree(folder.data.tree);
}

export async function getFile(url: string, fileF: TreeWithContent) {
  const file = await octokit.git.getBlob({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    file_sha: fileF.sha!,
  });
  return file.data;
}

export async function getCommits(
  url: string,
  query: operations["repos/list-commits"]["parameters"]["query"],
) {
  const commits = await octokit.repos.listCommits({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    ...query,
  });
  return commits.data;
}

export async function getCommit(
  url: string,
  ref: string,
  query?: operations["repos/get-commit"]["parameters"]["query"],
) {
  const commit = await octokit.repos.getCommit({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    ref,
    ...query,
  });
  return commit.data;
}

export async function getPR(url: string, prNumber: number) {
  const pr = await octokit.pulls.get({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    pull_number: prNumber,
  });
  return pr.data;
}

export async function getPrFiles(url: string, prNumber: number) {
  const files = await octokit.pulls.listFiles({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    pull_number: prNumber,
  });
  return files.data;
}

export async function getReleases(
  url: string,
  query?: operations["repos/list-releases"]["parameters"]["query"],
) {
  const releases = await octokit.repos.listReleases({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    ...query,
  });
  return releases.data;
}

export async function getTimeline(
  url: string,
  issue: number,
  query?: operations["issues/list-events-for-timeline"]["parameters"]["query"],
) {
  const timeline = await octokit.issues.listEventsForTimeline({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    issue_number: issue,
    ...query,
  });
  return await Promise.all(
    timeline.data.map(async (t) => {
      if (t.event === "commented" || t.event === "reviewed")
        t.body = await getMarkdown(t.body ?? "*No description provided.*");
      // @ts-expect-error now it does
      if (t.event === "committed") t.commit = await getCommit(url, t.sha!);
      return t;
    }),
  );
}

export async function getMarkdown(text: string) {
  const markdown = await octokit.markdown.render({ text });
  return markdown.data;
}

export async function getTags(
  url: string,
  query?: operations["repos/list-tags"]["parameters"]["query"],
) {
  const tags = await octokit.repos.listTags({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    ...query,
  });
  return tags.data;
}

function loop(tree: TreeWithContent[], path: string): TreeWithContent | undefined {
  for (const t of tree) {
    if (t.type !== "tree") continue;
    if (path === t.path) return t;
    // the replace is for lets say path is "something/somethings/somemore" and t.path is "something/something" doesnt cause issues, without the replace some files/folders would be lost
    else if (path.includes(t.path!) && path.replace(`${t.path!}`, "").startsWith("/"))
      return loop(t.tree!, path);
  }
}

function addToTree(
  tree: TreeWithContent[],
  pathToFind: string,
  add: TreeWithContent & { latestCommit?: components["schemas"]["commit"] },
) {
  const split = pathToFind.split("/");
  const withoutLast = split.slice(0, split.length - 1);
  const addTo = loop(tree, withoutLast.join("/"));
  if (!addTo) console.info(addTo, pathToFind, withoutLast.join("/"));
  addTo?.tree?.push(add);
}

// sorts folder first the files
function sortFolder(tree: TreeWithContent[]) {
  tree.sort((a, b) => {
    if (a.tree) sortFolder(a.tree as never);
    if (b.tree) sortFolder(b.tree as never);
    return (b.type === "tree" ? 1 : 0) - (a.type === "tree" ? 1 : 0);
  });
}

function sortTree(tree: components["schemas"]["git-tree"]["tree"]) {
  const arr: TreeWithContent[] = [];

  for (const t of tree) {
    const l = t.path?.split("/");
    const filename = t.path!.split("/")[t.path!.split("/").length - 1];
    const type = filename.split(".");
    const h = {
      ...t,
      filename,
      tree: t.type === "tree" ? [] : undefined,
      fileType: t.type === "blob" ? filename.split(".")[type.length - 1] : undefined,
    };
    if (l?.length === 1) arr.push(h);
    else addToTree(arr, t.path!, h);
  }

  sortFolder(arr);
  return arr;
}

export function abbreviateNumber(value: number): string {
  // eslint-disable-next-line new-cap
  return Intl.NumberFormat(undefined, { notation: "compact" }).format(value);
}
