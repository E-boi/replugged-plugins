import { useEffect, useState } from "react";
import {
  Branch,
  RepoQuery,
  TreeWithContent,
  getBranch,
  getBranches,
  getCommit,
  getFolder,
  getRepo,
} from "./utils";
import type { components } from "@octokit/openapi-types";
import { common } from "replugged";
import { useCommits, useIssues } from "./paginate";

export default function useRepo(url: string, query: RepoQuery) {
  const [repo, setRepo] = useState<{
    repo: components["schemas"]["full-repository"];
    tree: TreeWithContent[];
    branches: Branch[];
    readme?: components["schemas"]["content-file"];
    currentBranch: Branch;
  }>();
  const [status, setStatus] = useState<"loading" | "completed">("loading");
  const issues = useIssues(url, "issue");
  const prs = useIssues(url, "pr");
  const commits = useCommits(url, { branch: repo?.currentBranch.name });
  const [iQuery, setQuery] = useState(query);
  const [force, setForce] = useState(false);

  useEffect(() => {
    if (repo && !force) return;

    const fetch = async () => {
      setStatus("loading");
      void issues.fetch(force);
      void prs.fetch(force);

      const repo = await getRepo(url);
      const defaultBranch = await getBranch(url, repo.default_branch);
      const branches = (await getBranches(url)).filter((b) => b.name !== defaultBranch.name);
      branches.unshift(defaultBranch);
      const currentBranch = iQuery?.branch
        ? branches.find((b) => b.name === iQuery.branch)!
        : defaultBranch;
      const tree = await getFolder(url, currentBranch.commit.sha, {
        recursive: "1",
        branch: currentBranch.name,
      });
      // const readme =
      //   (await getReadme(url, undefined, currentBranch.name).catch(() => {})) || undefined;

      const readme = undefined;

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
    };

    void fetch();
  }, [JSON.stringify(iQuery), force]);

  const getBranchCommit = async (name: string) => {
    if (!repo) return;

    const idx = repo.branches.findIndex((b) => b.name === name);
    if (idx === -1) return;
    const commit = await getCommit(url, name);
    repo.branches[idx].commitInfo = commit;
    if (repo?.currentBranch.name === name) repo.currentBranch.commitInfo = commit;

    setRepo(common.lodash.cloneDeep(repo));
  };

  const updated = () => {
    setRepo(common.lodash.cloneDeep(repo));
  };

  const refetch = (q: RepoQuery, force?: boolean) => {
    if (!force && JSON.stringify(q) === JSON.stringify(iQuery)) return;
    common.ReactDOM.unstable_batchedUpdates(() => {
      setQuery(q);
      setForce(Boolean(force));
    });
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
  };
}
