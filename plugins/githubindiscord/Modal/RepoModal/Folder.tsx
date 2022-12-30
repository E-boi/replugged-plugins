import { FolderWithCommit, back } from "../../utils";
import { FileDirectoryFillIcon, FileIcon } from "@primer/styled-octicons";
import { Box, Text } from "@primer/react";
import { webpack } from "replugged";

const textClasses = webpack.getByProps("heading-sm/bold");

export default ({
  dir,
  onClick,
  path,
}: {
  dir: FolderWithCommit[];
  onClick: (type: "folder" | "file", path?: string) => void;
  path?: string;
}) => {
  return (
    <div>
      {path && <Text>{`/${path}`}</Text>}
      <Box
        className={path ? "Gin-folder" : "Gout-folder"}
        borderColor="border.default"
        borderWidth={1}
        borderStyle="solid">
        {path && (
          <div className="backbtn">
            <Box
              borderColor="border.default"
              borderTopWidth={0}
              borderWidth={1}
              px={3}
              py={2}
              pt={0}>
              <a
                onClick={() => {
                  const goBack = back(dir);
                  if (!goBack) return onClick("folder");
                  return onClick("folder", goBack);
                }}
                className={textClasses?.["heading-lg/normal"]}>
                ..
              </a>
            </Box>
          </div>
        )}
        {dir?.map((tree: { type: string; name: string; path: string }) => (
          <div
            className={
              tree.type === "dir"
                ? "Gfolder"
                : `Gfile ${tree.name.split(".")[tree.name.split(".").length - 1]} ${
                    tree.name.includes(".") ? "" : "blank"
                  }`
            }>
            {tree.type === "dir"
              ? [
                  <Box
                    borderColor="border.default"
                    borderTopWidth={1}
                    borderStyle="solid"
                    px={3}
                    py={2}>
                    <FileDirectoryFillIcon size={16} mr={2} />
                    <a onClick={() => onClick("folder", tree.path)}>{tree.name}</a>
                  </Box>,
                ]
              : [
                  <Box
                    borderColor="border.default"
                    borderTopWidth={1}
                    borderStyle="solid"
                    px={3}
                    py={2}>
                    <FileIcon size={16} mr={2} />
                    <a onClick={() => onClick("file", tree.name)}>{tree.name}</a>
                  </Box>,
                ]}
          </div>
        ))}
      </Box>
    </div>
  );
};
