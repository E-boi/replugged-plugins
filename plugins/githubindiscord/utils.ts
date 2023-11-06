import { settings } from "replugged";
import { Octokit } from "@octokit/rest";
import { components, operations } from "@octokit/openapi-types";

export type Branch = components["schemas"]["branch-short"] & {
  commitInfo?: components["schemas"]["commit"];
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
  commit?: components["schemas"]["commit"];
  hasReadme?: boolean;
  readme?: components["schemas"]["content-file"];
};

export type Issue = Awaited<
  ReturnType<typeof octokit.search.issuesAndPullRequests>
>["data"]["items"][0] & {
  pull?: components["schemas"]["pull-request"];
  timeline?: operations["issues/list-events-for-timeline"]["responses"]["200"]["content"]["application/json"];
  files?: operations["pulls/list-files"]["responses"]["200"]["content"]["application/json"];
  marked?: boolean;
};

export const pluginSettings = await settings.init<{
  key: string;
  darkTheme: string;
  lightTheme: string;
  view: "standard" | "treeview";
}>("dev.eboi.githubindiscord", {
  darkTheme: "dark_discord",
  lightTheme: "light_discord",
  view: "standard",
});

export const octokit = new Octokit({ auth: pluginSettings.get("key") });

export async function getReadme(url: string, dir?: string, ref?: string) {
  const readme = dir
    ? await octokit.repos.getReadmeInDirectory({
        owner: url.split("/")[0]!,
        repo: url.split("/")[1],
        dir,
        ref,
      })
    : await octokit.repos.getReadme({ owner: url.split("/")[0]!, repo: url.split("/")[1] });
  return readme.data;
}

export async function getBranches(
  url: string,
  query?: operations["repos/list-branches"]["parameters"]["query"],
) {
  const branches = await octokit.repos.listBranches({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    per_page: 100,
    ...query,
  });

  return branches.data;
  // return await Promise.all(
  //   branches.data.map(async (b) => ({ ...b, commit: await getCommit(url, b.name) })),
  // );
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

  // return folder;
  return sortTree(folder.data.tree);
}

export async function getFolderInfo(
  url: string,
  query: operations["repos/list-commits"]["parameters"]["query"],
) {
  const commits = await getCommits(url, query);
  const readme = (await getReadme(url, query.path, query.sha).catch(() => {})) || undefined;

  return { commits, readme };
}

export async function getFile(url: string, sha: string) {
  const file = await octokit.git.getBlob({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    file_sha: sha,
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

export async function getIssue(url: string, issueNumber: number) {
  const issue = await octokit.issues.get({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1]!,
    issue_number: issueNumber,
  });

  return issue.data;
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
      // if (t.event === "commented" || t.event === "reviewed")
      //   t.body = await getMarkdown(t.body ?? "*No description provided.*");
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
    const filename = t.path!.split("/").at(-1)!;
    const h = {
      ...t,
      filename,
      tree: t.type === "tree" ? [] : undefined,
      fileType: t.type === "blob" ? filename.split(".").at(-1) : undefined,
    };
    if (l?.length === 1) arr.push(h);
    else addToTree(arr, t.path!, h);
  }

  sortFolder(arr);
  return arr;
}

export function sortCommits(commits: Array<NonNullable<TreeWithContent["commit"]>>) {
  const arr: Array<typeof commits> = [[commits[0]]];
  let currentIdx = 0;

  commits.sort((a, b) => {
    const aDate = new Date(a.commit.author!.date!),
      bDate = new Date(b.commit.author!.date!);

    if (aDate.getMonth() === bDate.getMonth() && aDate.getDate() === bDate.getDate())
      arr[currentIdx].push(a);
    else {
      ++currentIdx;
      arr.push([a]);
    }

    return 1;
  });

  return arr;
}

export const classes = (...classes: unknown[]) => classes.filter(Boolean).join(" ");

export function abbreviateNumber(value: number): string {
  // eslint-disable-next-line new-cap
  return Intl.NumberFormat(undefined, { notation: "compact" }).format(value);
}
