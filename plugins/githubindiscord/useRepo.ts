import { useEffect, useState } from "react";
import {
  Branch,
  RepoQuery,
  TreeWithContent,
  getBranch,
  getBranches,
  getCommit,
  getFolder,
  getReadme,
  getRepo,
} from "./utils";
import type { components } from "@octokit/openapi-types";
import { common } from "replugged";
import { useCommits, useIssues } from "./paginate";
import { GithubLink } from ".";

export default function useRepo(link: GithubLink, query: RepoQuery) {
  const [repo, setRepo] = useState<{
    repo: components["schemas"]["full-repository"];
    tree: TreeWithContent[];
    branches: Branch[];
    readme?: components["schemas"]["content-file"];
    currentBranch: Branch;
  }>();
  const [status, setStatus] = useState<"loading" | "completed">("loading");
  const issues = useIssues(link.url, "issue");
  const prs = useIssues(link.url, "pr");
  const commits = useCommits(link.url, { branch: repo?.currentBranch.name });
  const [iQuery, setQuery] = useState(query);
  const [force, setForce] = useState(false);
  const [error, setError] = useState<unknown>();

  if (error) {
    throw error as Error;
  }

  useEffect(() => {
    if (repo && !force) return;

    const fetch = async () => {
      setStatus("loading");
      try {
        void issues.fetch(force);
        void prs.fetch(force);

        const repo = await getRepo(link.url);
        const defaultBranch = await getBranch(link.url, repo.default_branch);
        const branches = (await getBranches(link.url)).filter((b) => b.name !== defaultBranch.name);
        branches.unshift(defaultBranch);
        const currentBranch = iQuery?.branch
          ? branches.find((b) => b.name === iQuery.branch) ?? defaultBranch
          : defaultBranch;

        const tree = await getFolder(link.url, currentBranch.commit.sha, {
          recursive: "1",
          branch: currentBranch.name,
        });
        const readme =
          (await getReadme(link.url, undefined, currentBranch.name).catch(() => {})) || undefined;

        setRepo({
          repo,
          branches,
          currentBranch,
          tree,
          readme,
        });
        setForce(false);
        setStatus("completed");

        void commits.fetch(force, currentBranch.name);
      } catch (err) {
        setError(err);
      }
    };

    void fetch();
  }, [JSON.stringify(iQuery), force]);

  const getBranchCommit = async (name: string) => {
    if (!repo) return;

    const idx = repo.branches.findIndex((b) => b.name === name);
    if (idx === -1) return;
    const commit = await getCommit(link.url, name);
    repo.branches[idx].commitInfo = commit;
    if (repo?.currentBranch.name === name) repo.currentBranch.commitInfo = commit;

    setRepo(common.lodash.cloneDeep(repo));
  };

  const updated = () => {
    setRepo(common.lodash.cloneDeep(repo));
  };

  const refetch = (q: RepoQuery, force?: boolean) => {
    if (!force && JSON.stringify(q) === JSON.stringify(iQuery)) return;
    setQuery(q);
    setForce(Boolean(force));
  };

  const switchBranch = (name: string) => {
    const branch = repo?.branches.find((b) => b.name === name);
    if (!branch) return;
    refetch({ ...iQuery, branch: branch.name }, true);
  };

  return {
    data: repo,
    status,
    getBranchCommit,
    updated,
    issues,
    prs,
    commits,
    refetch,
    switchBranch,
    link,
  };
}
