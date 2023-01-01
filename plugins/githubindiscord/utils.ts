import { settings } from "replugged";
import { Octokit } from "@octokit/rest";
import t, { components } from "@octokit/openapi-types";

export interface File {
  content: string;
  isImage: boolean;
  path: string;
  type: string;
}

export const pluginSettings = await settings.init("dev.eboi.githubindiscord");
const octokit = new Octokit({ auth: pluginSettings.get("key") });

export function back(dir: components["schemas"]["content-directory"]): string | null {
  const folder: string[] = dir[0].path.split("/");
  if (folder.length <= 2) return null;
  return dir[0].path.replace(`/${folder[folder.length - 2]}/${folder[folder.length - 1]}`, "");
}

export async function getBranches(
  url: string,
  query?: t.operations["repos/list-branches"]["parameters"]["query"],
) {
  const branches = await octokit.repos.listBranches({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    ...query,
  });
  return branches.data;
}

export async function getRepo(url: string) {
  const repo = await octokit.repos.get({ owner: url.split("/")[0]!, repo: url.split("/")[1] });
  const commit = await octokit.repos.getCommit({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    ref: repo.data.default_branch,
  });
  return { ...repo.data, commit: commit.data };
}

export async function getFolder(url: string, branch: string, path?: string) {
  const folder = await octokit.repos.getContent({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    path: path || "",
    ref: branch,
  });

  if (!Array.isArray(folder.data)) return null;
  const folders = folder.data.map(async (e) => {
    const isFolder = e.type === "dir";
    if (isFolder)
      return { ...e, commit: (await getCommits(url, { path: e.path, per_page: 1 }))![0] };
    return isFolder && e;
  });
  const files = folder.data.map(async (e) => {
    const isFile = e.type === "file";
    if (isFile) return { ...e, commit: (await getCommits(url, { path: e.path, per_page: 1 }))![0] };
    return isFile && e;
  });

  const lastestCommit = (await getCommits(url, { path: path || "", per_page: 1 }))![0];
  return {
    commit: lastestCommit,
    path,
    content: [
      ...(await Promise.all(folders)).filter(Boolean),
      ...(await Promise.all(files)).filter(Boolean),
    ],
  };
}

const imageTypes = ["png", "jpg"];

export async function getFile(
  folder: components["schemas"]["content-directory"],
  fileName: string,
): Promise<File | null> {
  const file = folder.filter((f) => f.type === "file" && f.name === fileName);
  const type = fileName.split(".");
  const isImage = imageTypes.includes(type[type.length - 1]);
  if (file.length === 0) return null;
  if (isImage)
    return {
      path: file[0].path,
      content: file[0].download_url!,
      type: type[type.length - 1],
      isImage,
    };
  const fileReq = await fetch(file[0].download_url!);
  const content = await fileReq.text();
  return { path: file[0].path, content, type: type[type.length - 1], isImage };
}

export async function getCommits(
  url: string,
  query: t.operations["repos/list-commits"]["parameters"]["query"],
) {
  const commits = await octokit.repos.listCommits({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    ...query,
  });
  // const commits = await fetch(`https://api.github.com/repos/${url}/commits?${query}`, {
  //   headers: headers(),
  // });

  // if (!commits.ok) return null;

  // const json = await commits.json();
  return commits.data;
}

export async function getCommit(
  url: string,
  ref: string,
  query?: t.operations["repos/get-commit"]["parameters"]["query"],
) {
  // const commits = await fetch(`https://api.github.com/repos/${url}/commits/${ref}`, {
  //   headers: headers(),
  // });

  // if (!commits.ok) return null;

  // const json = await commits.json();
  // return json;
  const commit = await octokit.repos.getCommit({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    ref,
    ...query,
  });
  return commit.data;
}

export async function getIssues(
  url: string,
  query: t.operations["issues/list"]["parameters"]["query"],
) {
  // const issues = await fetch(`https://api.github.com/repos/${url}/issues?${query}`, {
  //   headers: headers(),
  // });
  // if (!issues.ok) return null;
  // const json: Issue[] = await issues.json();
  // return json.filter((issue) => !issue.pull_request);
  const issues = await octokit.issues.listForRepo({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    ...query,
  });
  return issues.data.filter((issue) => !issue.pull_request);
}

export async function getIssue(url: string, issueNumber: number) {
  // const issue = await fetch(`https://api.github.com/repos/${url}/issues/${issueNumber}`, {
  //   headers: headers(),
  // });
  // if (!issue.ok) return null;
  // const json = await issue.json();
  // return json;
  const issue = await octokit.issues.get({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    issue_number: issueNumber,
  });
  return issue;
}

export async function getPRs(
  url: string,
  query?: t.operations["pulls/list"]["parameters"]["query"],
) {
  // const prs = await fetch(`https://api.github.com/repos/${url}/pulls?${query}`, {
  //   headers: headers(),
  // });
  // if (!prs.ok) return null;
  // const json = await prs.json();
  // return json;
  const prs = await octokit.pulls.list({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    ...query,
  });
  return prs.data;
}

export async function getPR(url: string, prNumber: number) {
  // const pr = await fetch(`https://api.github.com/repos/${url}/pulls/${prNumber}`, {
  //   headers: headers(),
  // });
  // if (!pr.ok) return null;
  // const json = await pr.json();
  // return json;
  const pr = await octokit.pulls.get({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    pull_number: prNumber,
  });
  return pr.data;
}

export async function getReleases(
  url: string,
  query?: t.operations["repos/list-releases"]["parameters"]["query"],
) {
  // const releases = await fetch(
  //   `https://api.github.com/repos/${url}/releases${lastest ? "/lastest" : ""}`,
  //   { headers: headers() },
  // );
  // if (!releases.ok) return null;
  // const json = await releases.json();
  // return json;
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
  query?: t.operations["issues/list-events-for-timeline"]["parameters"]["query"],
) {
  // const timeline = await fetch(url, { headers: headers() });
  // if (!timeline) return null;
  // const json = await timeline.json();
  // return json;
  const timeline = await octokit.issues.listEventsForTimeline({
    owner: url.split("/")[0]!,
    repo: url.split("/")[1],
    issue_number: issue,
    ...query,
  });
  return timeline.data;
}

export function abbreviateNumber(value: number): string {
  let newValue = value.toString();
  if (value >= 1000) {
    const suffixes = ["", "k", "m", "b", "t"];
    const suffixNum = Math.floor(value.toString().length / 3);
    let shortValue = 0;
    for (let precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat(
        (suffixNum ? value / Math.pow(1000, suffixNum) : value).toPrecision(precision),
      );
      const dotLessShortValue = shortValue.toString().replace(/[^a-zA-Z 0-9]+/g, "");
      if (dotLessShortValue.length <= 2) break;
    }
    newValue = shortValue.toString() + suffixes[suffixNum];
  }
  return newValue;
}
