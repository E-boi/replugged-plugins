import { FC, memo, useEffect, useState } from "react";
import { Spinner } from "../../components";
import { Branch, File, Folder, Repo, getFile, getFolder, pluginSettings } from "../../utils";
import FileModal from "./File";
import FolderModal from "./Folder";

type Props = {
  url: string;
  repo: Repo | null;
  branch: Branch | null;
};

const RepoModal: FC<Props> = ({ url, repo, branch }) => {
  const [rootDir, setRootDir] = useState<Folder[] | null>(null);
  const [folder, setFolder] = useState<Folder[] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const key = pluginSettings.get("key", "") as string;

  useEffect(() => {
    (async () => {
      if (!branch) return;
      const rootDir = await getFolder(url, branch.name, key);
      setRootDir(rootDir);
      setFolder(null);
      setFile(null);
    })();
  }, [branch]);

  let path;
  if (folder && !file) {
    const dir = folder[0]?.path.split("/");
    path = folder[0].path.replace(`/${dir[dir.length - 1]}`, "");
  } else if (file) path = file.path;

  if ((!repo || !rootDir) && Spinner)
    return (
      <p className="Gfetching">
        Fetching repo
        <Spinner type="wanderingCubes" />
      </p>
    );
  else if (rootDir && !file)
    return (
      <FolderModal
        dir={folder || rootDir}
        onClick={(type, to) => {
          if (!to) return setFolder(null);
          if (type === "folder")
            return getFolder(url, branch!.name, key, to).then((e) => setFolder(e));
          else return getFile(folder || rootDir, to).then((e) => setFile(e));
        }}
        path={path}
      />
    );
  else if (file && path) return <FileModal file={file} path={path} onClose={() => setFile(null)} />;
  return null;
};

export default memo(RepoModal);
