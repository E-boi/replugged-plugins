import { back } from "../../utils";
import { FileDirectoryFillIcon, FileIcon } from "@primer/styled-octicons";
import { Avatar, Box, RelativeTime, Text, Truncate } from "@primer/react";
import { webpack } from "replugged";
import { components } from "@octokit/openapi-types";

const textClasses = webpack.getByProps("heading-sm/bold");

export default ({
  dir,
  onClick,
}: {
  dir: {
    commit: components["schemas"]["commit"];
    content: components["schemas"]["content-directory"];
    path?: string;
  };
  onClick: (type: "folder" | "file", path?: string) => void;
}) => {
  return (
    <div>
      <Box
        className={dir.path ? "Gin-folder" : "Gout-folder"}
        borderColor="border.subtle"
        borderWidth={1}
        borderStyle="solid">
        <Box
          borderColor="border.subtle"
          backgroundColor="border.default"
          borderTopWidth={0}
          borderWidth={1}
          px={3}
          py={2}
          pt={2}
          sx={{ alignItems: "center", display: "flex" }}>
          {dir.commit.author && (
            <a href={dir.commit.author.avatar_url} target="_blank">
              <Avatar src={dir.commit.author.avatar_url} size={24} />
            </a>
          )}
          <Truncate
            maxWidth={"100%"}
            title={`${dir.commit.author?.login} ${dir.commit.commit.message}`}>
            <Text fontWeight="bold" sx={{ marginLeft: "5px" }}>
              {dir.commit.author?.login}
              <Text fontWeight="normal"> {dir.commit.commit.message}</Text>
            </Text>
          </Truncate>
          <RelativeTime
            sx={{ marginLeft: "auto" }}
            datetime={dir.commit.commit.author?.date}
            format="relative"
          />
        </Box>
        {dir.path && (
          <div className="backbtn">
            <Box
              borderColor="border.subtle"
              borderTopWidth={0}
              borderWidth={1}
              px={3}
              py={2}
              pt={0}>
              <a
                onClick={() => {
                  const goBack = back(dir.content);
                  if (!goBack) return onClick("folder");
                  return onClick("folder", goBack);
                }}
                className={textClasses?.["heading-lg/normal"]}
                style={{ width: "100%" }}>
                ..
              </a>
            </Box>
          </div>
        )}
        {dir.content?.map((tree) => (
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
                    borderColor="border.subtle"
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
                    borderColor="border.subtle"
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
