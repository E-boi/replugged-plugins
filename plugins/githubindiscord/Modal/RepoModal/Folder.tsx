import { Arrow } from "../../components";
import { Folder, back } from "../../utils";

const FolderIcon = "https://raw.githubusercontent.com/E-boi/assets/main/folder.svg";
const FileIcon = "https://raw.githubusercontent.com/E-boi/assets/main/ghfile.svg";

export default ({
  dir,
  onClick,
  path,
}: {
  dir: Folder[];
  onClick: (type: "folder" | "file", path?: string) => void;
  path?: string;
}) => {
  return (
    <div className={path ? "Gin-folder" : "Gout-folder"}>
      {path && (
        <div className="Gpath">
          <span>{`/${path}`}</span>
          <Arrow
            direction="LEFT"
            onClick={() => {
              const goBack = back(dir);
              if (!goBack) return onClick("folder");
              return onClick("folder", goBack);
              // getFolder(url, goBack, selectedBranch, key).then((e) => setFolder(e));
            }}
          />
        </div>
      )}
      {dir?.map((tree: { type: string; name: string; path: string }) => (
        <p
          className={
            tree.type === "dir"
              ? "Gfolder"
              : `Gfile ${tree.name.split(".")[tree.name.split(".").length - 1]} ${
                  tree.name.includes(".") ? "" : "blank"
                }`
          }>
          {tree.type === "dir"
            ? [
                <img src={FolderIcon} height={16} width={16} />,
                <a onClick={() => onClick("folder", tree.path)}>{tree.name}</a>,
              ]
            : [
                <img src={FileIcon} height={16} width={16} />,
                <a onClick={() => onClick("file", tree.name)}>{tree.name}</a>,
              ]}
        </p>
      ))}
    </div>
  );
};
