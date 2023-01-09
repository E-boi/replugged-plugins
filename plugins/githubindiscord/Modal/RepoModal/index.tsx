import { components } from "@octokit/openapi-types";
import { Spinner } from "@primer/react";
import { FC, memo, useEffect, useState } from "react";
import { File, getFile, getFolder } from "../../utils";
import FolderModal from "./Folder";
import FileModal from "./File";
import { webpack } from "replugged";

const textClasses = webpack.getByProps("heading-sm/bold");

type Props = {
  url: string;
  repo: (components["schemas"]["repository"] & { commit: components["schemas"]["commit"] }) | null;
  branch: components["schemas"]["branch-short"] | null;
  trigger: (path?: string) => void;
  path?: string;
};

const RepoModal: FC<Props> = ({ url, repo, branch, trigger, path }) => {
  const [folder, setFolder] = useState<{
    commit: components["schemas"]["commit"];
    content: components["schemas"]["content-directory"];
    path?: string;
  } | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      if (!branch) return;
      const rootDir = await getFolder(url, branch.name, path);
      setFolder(rootDir as any);
      setFile(null);
    })();
  }, [branch, path]);

  if (!folder)
    return (
      <div className={[textClasses?.['heading-lg/medium'], 'fetching'].join(' ')}>
        <span>Fetching Repository Contents...</span>
        <Spinner size="large"/>
      </div>
    );

  return (
    <>
      {folder && repo && !file && (
        <FolderModal
          dir={folder}
          onClick={(type, to) => {
            if (type === "folder") trigger(to);
            else getFile(folder.content, to as string).then((e) => setFile(e));
          }}
        />
      )}
      {file && <FileModal file={file} onClose={() => setFile(null)} />}
    </>
  );
};

export default memo(RepoModal);
