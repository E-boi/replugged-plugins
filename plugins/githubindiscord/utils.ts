import { settings } from "replugged";

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface File {
  content: string;
  isImage: boolean;
  path: string;
  type: string;
}

/* eslint-disable @typescript-eslint/naming-convention */
export interface Folder {
  download_url?: string;
  git_url: string;
  html_url: string;
  name: string;
  path: string;
  sha: string;
  size: number;
  type: "dir" | "file";
  url: string;
}

export interface Repo {
  allow_forking: boolean;
  archive_url: string;
  archived: boolean;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  clone_url: string;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  content_url: string;
  contributors_url: string;
  created_at: string;
  default_branch: string;
  deployments_url: string;
  description: string;
  disabled: boolean;
  downloads_url: string;
  events_url: string;
  fork: boolean;
  forks: number;
  forks_count: number;
  forks_url: string;
  full_name: string;
  git_commit_url: string;
  git_refs_url: string;
  git_url: string;
  has_discussions: boolean;
  has_downloads: boolean;
  has_issues: boolean;
  has_pages: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  homepage: string;
  hooks_url: string;
  html_url: string;
  id: number;
  is_template: boolean;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  language: string;
  languages_url: string;
  license?: {
    key: string;
    name: string;
    url?: string;
    spdx_id?: string;
    html_url: string;
  };
  organization?: User;
  merges_url: string;
  milestones_url: string;
  mirror_url?: string;
  name: string;
  network_count: number;
  node_id: string;
  notifications_url: string;
  open_issues: number;
  open_issues_count: number;
  owner: User;
  permissions: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
  private: boolean;
  pulls_url: string;
  pushed_at: string;
  releases_url: string;
  size: number;
  ssh_url: string;
  stargazers_count: number;
  stargazers_url: string;
  statuses_url: string;
  subscribers_count: number;
  subscribers_url: string;
  subscription_url: string;
  svn_url: string;
  tags_url: string;
  teams_url: string;
  topics: string[];
  trees_url: string;
  updated_at: string;
  url: string;
  visibility: string;
  watchers: number;
  watchers_count: null;
}

interface User {
  avatar_url: string;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string;
  html_url: string;
  id: string;
  login: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: string;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
}

export interface CommitWithoutFiles {
  url: string;
  sha: string;
  html_url: string;
  comments_url: string;
  commit: {
    url: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: CommitWithoutFiles["commit"]["author"];
    message: string;
    tree: {
      url: string;
      sha: string;
    };
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature?: string;
      payload?: string;
    };
  };
  author: User;
  committer: User;
  parents: Array<{ url: string; sha: string }>;
}

export type CommitWithFiles = CommitWithoutFiles & {
  stats: { additions: number; deletions: number; total: number };
  files: Array<{
    filename: string;
    additions: number;
    deletions: number;
    changes: number;
    status: string;
    raw_url: string;
    blob_url: string;
    patch: string;
  }>;
};

export type FolderWithCommit = Folder & { commit: CommitWithFiles };

export interface Label {
  url: string;
  name: string;
  color?: string;
  default: boolean;
  description?: string;
}

export interface Milestone {
  url: string;
  html_url: string;
  labels_url: string;
  number: number;
  state: "open" | "closed";
  title: string;
  description?: string;
  creater?: User;
  open_issues: number;
  closed_issues: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  due_on?: string;
}

export type authorAssociation =
  | "COLLABORATOR"
  | "CONTRIBUTOR"
  | "FIRST_TIMER"
  | "FIRST_TIME_CONTRIBUTOR"
  | "MANNEQUIN"
  | "MEMBER"
  | "NONE"
  | "OWNER";

export interface Issue {
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  number: number;
  title: string;
  user?: User;
  labels: Array<Label | string>;
  state: "open" | "closed";
  state_reason?: "completed" | "reopened" | "not_planned";
  locked: boolean;
  assignee?: User;
  assignees?: User[];
  milestone?: Milestone;
  active_lock_reason?: string;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  body?: string;
  pull_request?: {
    merged_at?: string;
    diff_url?: string;
    html_url?: string;
    patch_url?: string;
    url?: string;
  };
  draft: boolean;
  closed_by?: User;
  timeline_url: string;
  author_association: authorAssociation;
  reactions: {
    url: string;
    total_count: number;
    "+1": number;
    "-1": number;
    laugh: number;
    confused: number;
    heart: number;
    hooray: number;
    eyes: number;
    rocket: number;
  };
}

export interface PullRequest {
  url: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  number: number;
  state: "closed" | "open";
  locked: boolean;
  title: string;
  user?: User;
  body?: string;
  labels?: Label[];
  milestone?: Milestone;
  active_lock_reason?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  merged_at?: string;
  merge_commit_sha?: string;
  assignee?: User;
  assignees?: User[];
  requested_reviewers?: User[];
  head: {
    label: string;
    ref: string;
    repo: Repo;
    sha: string;
    user?: User;
  };
  base: {
    label: string;
    ref: string;
    repo: Repo;
    sha: string;
    user?: User;
  };
  auto_merge?: boolean;
  draft: boolean;
  author_association: authorAssociation;
}

export interface Release {
  url: string;
  html_url: string;
  assets_url: string;
  upload_url: string;
  tarball_url?: string;
  zipball_url?: string;
  tag_name: string;
  target_commitish: string;
  name?: string;
  body?: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at?: string;
  author?: User;
  assets: Array<{
    url: string;
    browser_download_url: string;
    name: string;
    label?: string;
    state: "uploaded" | "open";
    content_type: string;
    size: number;
    download_count: number;
    created_at: string;
    updated_at: string;
    uploader?: User;
    discussion_url: string;
    reactions: {
      url: string;
      total_count: number;
      "+1": number;
      "-1": number;
      laugh: number;
      confused: number;
      heart: number;
      hooray: number;
      eyes: number;
      rocket: number;
    };
  }>;
}

/* eslint-enable @typescript-eslint/naming-convention */

export const pluginSettings = await settings.init("dev.eboi.githubindiscord");

const headers = (): HeadersInit => ({
  accept: "application/vnd.github+json",
  Authorization: pluginSettings.get("key") ? `token ${pluginSettings.get("key") as string}` : "",
});

export function back(dir: Folder[]): string | null {
  const folder: string[] = dir[0].path.split("/");
  if (folder.length <= 2) return null;
  return dir[0].path.replace(`/${folder[folder.length - 2]}/${folder[folder.length - 1]}`, "");
}

export async function getBranches(url: string): Promise<Branch[]> {
  const branches = await fetch(`https://api.github.com/repos/${url}/branches?per_page=100`, {
    headers: headers(),
  });
  if (!branches.ok) return [];
  const json = await branches.json();
  return json;
}

export async function getRepo(url: string): Promise<Repo> {
  const repo = await fetch(`https://api.github.com/repos/${url}`, {
    headers: headers(),
  });
  if (!repo.ok) throw Error((await repo.json()).message);
  const json = await repo.json();
  return json;
}

export async function getFolder(
  url: string,
  branch: string,
  folder?: string,
): Promise<FolderWithCommit[] | null> {
  const folderF = await fetch(
    `https://api.github.com/repos/${url}/contents/${folder || ""}?ref=${branch}`,
    {
      headers: headers(),
    },
  );
  if (!folderF.ok) return null;
  const json = await folderF.json();
  const folders: Array<Promise<FolderWithCommit>> = json.map(async (e: Folder) => {
    const isFolder = e.type === "dir";
    if (isFolder) return { ...e, commit: (await getCommits(url, `path=${e.path}`))![0] };
    return isFolder && e;
  });
  const files: Array<Promise<FolderWithCommit>> = json.map(async (e: Folder) => {
    const isFile = e.type === "file";
    if (isFile) return { ...e, commit: (await getCommits(url, `path=${e.path}`))![0] };
    return isFile && e;
  });

  return [
    ...(await Promise.all(folders)).filter(Boolean),
    ...(await Promise.all(files)).filter(Boolean),
  ];
}

const imageTypes = ["png", "jpg"];

export async function getFile(folder: Folder[], fileName: string): Promise<File | null> {
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

export async function getCommits(url: string, query: string): Promise<CommitWithoutFiles[] | null> {
  const commits = await fetch(`https://api.github.com/repos/${url}/commits?${query}`, {
    headers: headers(),
  });

  if (!commits.ok) return null;

  const json = await commits.json();
  return json;
}

export async function getCommit(url: string, ref: string): Promise<CommitWithFiles | null> {
  const commits = await fetch(`https://api.github.com/repos/${url}/commits/${ref}`, {
    headers: headers(),
  });

  if (!commits.ok) return null;

  const json = await commits.json();
  return json;
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
