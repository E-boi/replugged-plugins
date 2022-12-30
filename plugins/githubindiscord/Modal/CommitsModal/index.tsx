import { FC, memo, useEffect, useState } from "react";
import { Spinner } from "../../components";
import { Branch, CommitWithoutFiles, getCommits } from "../../utils";
import  Commit from "./Commit";
import { GitCommitIcon } from "@primer/styled-octicons";
 
type Props = { url: string; branch: Branch | null };

const CommitsModal: FC<Props> = ({ url, branch }) => {
  const [commits, setCommits] = useState<CommitWithoutFiles[] | null>(null);
  const [selectedCommit, setCommit] = useState<CommitWithoutFiles | null>(null);

  useEffect(() => {
    (async () => {
      if (!branch) return;
      setCommits(await getCommits(url, `sha=${branch.commit.sha}`)!);
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
      <div className="Gcommitlist">
        {commits?.map((commit) => (
          <div>
            <GitCommitIcon size={16}/>
            <a onClick={() => setCommit(commit.url)}>{commit.commit.message}</a>
          </div>
        ))}
      </div>
    );
  if (selectedCommit) return <Commit commitWithooutFile={selectedCommit} url={url} />;
  return null;
};

export default memo(CommitsModal);
