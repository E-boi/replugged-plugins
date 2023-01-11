import { settings } from "replugged";
import { Octokit } from "@octokit/rest";
import { components, operations } from "@octokit/openapi-types";
import { useEffect, useState } from "react";
import { paginateRest } from "@octokit/plugin-paginate-rest";

export type Branch = components["schemas"]["short-branch"] & {
  commit: components["schemas"]["commit"];
};

interface RepoQuery {
  branches?: operations["repos/list-branches"]["parameters"]["query"];
  tags?: operations["repos/list-tags"]["parameters"]["query"];
  issues?: operations["issues/list"]["parameters"]["query"];
  prs?: operations["pulls/list"]["parameters"]["query"];
  branch?: string;
}

export type TreeWithContent = components["schemas"]["git-tree"]["tree"][0] & {
  tree?: TreeWithContent[];
  latestCommit?: components["schemas"]["commit"];
  filename: string;
};

export type Issue = components["schemas"]["issue-search-result-item"];

export const pluginSettings = await settings.init("dev.eboi.githubindiscord");

const MyOctokit = Octokit.plugin(paginateRest);
const octokit = new MyOctokit({ auth: pluginSettings.get("key") });
const cache = new Map<
  string,
  {
    repo: components["schemas"]["full-repository"];
    tags: Array<components["schemas"]["tag"]>;
    tree: TreeWithContent[];
    issues: { total: number; open: Issue[]; closed: Issue[]; all: Issue[] };
    prs: { total: number; open: Issue[]; closed: Issue[]; all: Issue[] };
    branches: Branch[];
  }
>();

export async function getAll(url: string, query: RepoQuery) {
  if (cache.has(`${url}/${JSON.stringify(query)}`))
    return cache.get(`${url}/${JSON.stringify(query)}`)!;
  const repo = await getRepo(url);
  const defaultBranch = await getBranch(url, repo.default_branch);
  const branches = (await getBranches(url, { ...query?.branches })).filter(
    (b) => b.name !== defaultBranch.name,
  );
  const selectedBranch = query?.branch && branches.find((b) => b.name === query.branch);
  const issues = await getIssues(url);
  const tags = await getTags(url, { ...query?.tags });
  const tree = await getFolder(url, (selectedBranch || defaultBranch).commit.sha, {
    recursive: "1",
    branch: (selectedBranch || defaultBranch).name,
  });
  const prs = await getPRs(url);

  cache.set(`${url}/${JSON.stringify(query)}`, {
    repo,
    branches: [defaultBranch, ...branches],
    tags,
    issues,
    tree,
    prs,
  });

  return {
    repo,
    branches: [defaultBranch, ...branches],
    tags,
    issues,
    tree,
    prs,
  };
}

export function useRepo({ url, query }: { url: string; query: RepoQuery }) {
  const [repo, setRepo] = useState<{
    repo: components["schemas"]["full-repository"];
    tags: Array<components["schemas"]["tag"]>;
    tree: TreeWithContent[];
    issues: { total: number; open: Issue[]; closed: Issue[]; all: Issue[] };
    prs: { total: number; open: Issue[]; closed: Issue[]; all: Issue[] };
    branches: Branch[];
  }>();
  const [status, setStatus] = useState<"loading" | "err" | "complete">("loading");
  const [error, setError] = useState<string>();
  useEffect(() => {
    setStatus("loading");
    (async () => {
      try {
        const r = await getAll(url, query);
        setRepo(r);
        setStatus("complete");
      } catch (err) {
        // @ts-expect-error stfu
        setError(err.message as string);
        setStatus("err");
        console.error(err);
      }
    })();
  }, [JSON.stringify(query), url]);

  return { data: repo, status, error };
}

const headers = (): HeadersInit => ({
  accept: "application/vnd.github+json",
  Authorization: pluginSettings.get("key") ? `token ${pluginSettings.get("key") as string}` : "",
});

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
  return await sortTree(url, folder.data.tree, query?.branch);
}

export async function getFile(url: string, fileF: TreeWithContent) {
  const file = await octokit.git.getBlob({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    file_sha: fileF.sha!,
  });
  const type = fileF.filename.split(".");
  return { ...file.data, filename: fileF.filename, type: type[type.length - 1] };
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

export async function getIssues(url: string) {
  const res = await fetch(
    `https://api.github.com/search/issues?q=${encodeURIComponent(
      `repo:${url} type:issue state:open`,
    )}`,
    { headers: headers() },
  );
  const page: Issue[] = (await res.json()).items;
  const all = [...page] as unknown as Issue[];
  const open = page.filter((i) => i.state === "open").filter(Boolean) as unknown as Issue[];
  const closed = page.filter((i) => i.state === "closed").filter(Boolean) as unknown as Issue[];
  return { total: all.length, open, closed, all };
}

export async function getPRs(url: string) {
  const res = await fetch(
    `https://api.github.com/search/issues?q=${encodeURIComponent(
      `repo:${url} type:pr state:open`,
    )}`,
    { headers: headers() },
  );
  const page: Issue[] = (await res.json()).items;
  const all = [...page] as unknown as Issue[];
  const open = page.filter((i) => i.state === "open").filter(Boolean) as unknown as Issue[];
  const closed = page.filter((i) => i.state === "closed").filter(Boolean) as unknown as Issue[];
  return { total: all.length, open, closed, all };
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

function addToTree(
  tree: TreeWithContent[],
  pathToFind: string,
  add: TreeWithContent & { latestCommit?: components["schemas"]["commit"] },
) {
  tree.find((t) => {
    const split = pathToFind.split("/");
    const withoutLast = split.slice(0, split.length - 1);
    if (withoutLast.join("/") === t.path) {
      if (add) t.tree!.push(add);
      return t;
    } else return t.tree && addToTree(t.tree, pathToFind, add);
  });
}

// sorts folder first the files
function sortFolder(tree: TreeWithContent[]) {
  tree.sort((a, b) => {
    if (a.tree) sortFolder(a.tree as never);
    if (b.tree) sortFolder(b.tree as never);
    return (b.type === "tree" ? 1 : 0) - (a.type === "tree" ? 1 : 0);
  });
}

async function sortTree(
  url: string,
  tree: components["schemas"]["git-tree"]["tree"],
  branch?: string,
) {
  const withCommit = await Promise.all(
    tree.map(async (t) => {
      const commit =
        (t.type === "tree" &&
          (await getCommits(url, { per_page: 1, path: t.path!, sha: branch }))[0]) ||
        // eslint-disable-next-line no-undefined
        undefined;
      return {
        ...t,
        latestCommit: commit,
        filename: t.path!.split("/")[t.path!.split("/").length - 1],
      };
    }),
  );
  const arr: TreeWithContent[] = [];

  for (const t of withCommit) {
    // @ts-expect-error dont care
    if (t.type === "tree") t.tree = [];
    const l = t.path?.split("/");
    if (l?.length === 1) arr.push(t);
    else addToTree(arr, t.path!, t);
  }

  sortFolder(arr);

  return arr;
}

export function abbreviateNumber(value: number): string {
  // eslint-disable-next-line new-cap, no-undefined
  return Intl.NumberFormat(undefined, { notation: "compact" }).format(value);
}
