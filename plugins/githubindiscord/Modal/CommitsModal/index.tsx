import { FC, memo, useEffect, useState } from "react";
import { Spinner } from "../../components";
import { Branch, CommitWithoutFiles, getCommits, pluginSettings } from "../../utils";
import Commit from "./Commit";

type Props = { url: string; branch: Branch | null };

const CommitsModal: FC<Props> = ({ url, branch }) => {
  const [commits, setCommits] = useState<CommitWithoutFiles[] | null>(null);
  const [selectedCommit, setCommit] = useState<any>(null);
  const key = pluginSettings.get("key", "") as string;

  useEffect(() => {
    (async () => {
      if (!branch) return;
      setCommits(await getCommits(url, branch.commit.sha, key)!);
    })();
  }, [branch]);
  console.log(commits);
  if (!commits && Spinner)
    return (
      <p className="Gfetching">
        Fetching commits
        <Spinner type="wanderingCubes" />
      </p>
    );
  if (!selectedCommit)
    return (
      <div className="Gbrancheslist">
        {commits?.map((commit) => (
          <div>
            <a onClick={() => setCommit(commit.url)}>{commit.commit.message}</a>
          </div>
        ))}
      </div>
    );
  if (selectedCommit) return <Commit commitWithooutFile={selectedCommit} url={url} />;
  return null;
};

export default memo(CommitsModal);
