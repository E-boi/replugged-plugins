import { components } from "@octokit/openapi-types";
import { TreeWithContent } from "../../utils";
import { Avatar, Box, Link, RelativeTime, Text, Truncate } from "@primer/react";
import { blober } from "../../components";
import { FileDirectoryFillIcon, FileIcon } from "@primer/styled-octicons";

interface Props {
  commit?: components["schemas"]["commit"];
  tree: TreeWithContent[];
  back: boolean;
  onFolderClick: (tree: TreeWithContent) => void;
  onFileClick: (file: TreeWithContent) => void;
  onCommitClick: (commit: components["schemas"]["commit"]) => void;
  onBackClick: () => void;
}

export default ({
  commit,
  tree,
  onFileClick,
  onFolderClick,
  onCommitClick,
  back,
  onBackClick,
}: Props) => {
  return (
    <>
      <CommitHeader commit={commit} onClick={() => onCommitClick(commit!)} />
      <Box borderColor="border.default" borderStyle="solid" borderWidth={1} borderRadius={6} mt={1}>
        {back && (
          <Box
            display="flex"
            alignItems="center"
            sx={{ ":hover": { bg: "canvas.subtle" } }}
            px={3}
            py={2}
            onClick={onBackClick}>
            <FileDirectoryFillIcon color="marketingIcon.primary" size={16} mr={2} />
            <Link sx={{ color: "fg.default" }}>..</Link>
          </Box>
        )}
        {tree.map((tree, idx) => (
          <Box
            borderColor="border.muted"
            borderTopWidth={((idx || back) && 1) || 0}
            borderStyle="solid"
            display="flex"
            alignItems="center"
            sx={{ ":hover": { bg: "canvas.subtle" } }}
            px={3}
            py={2}>
            {tree.type === "tree" ? (
              <FileDirectoryFillIcon color="marketingIcon.primary" size={16} mr={2} />
            ) : (
              <FileIcon color="fg.muted" size={16} mr={2} />
            )}
            <Link
              sx={{ color: "fg.default" }}
              onClick={() => (tree.type === "tree" ? onFolderClick(tree) : onFileClick(tree))}>
              {tree.filename}
            </Link>
          </Box>
        ))}
      </Box>
    </>
  );
};

export function CommitHeader({
  commit,
  onClick,
}: {
  commit?: components["schemas"]["commit"];
  onClick: () => void;
}) {
  return (
    <Box
      borderColor="border.default"
      borderStyle="solid"
      borderWidth={1}
      borderRadius={6}
      alignItems="center"
      p={16}
      display="flex">
      {commit ? (
        <>
          <Avatar src={commit.author!.avatar_url} />
          <Truncate
            maxWidth={"100%"}
            sx={{ flex: 1 }}
            title={`${commit.author!.login} ${commit.commit.message.split("\n\n")[0]}`}>
            <Text fontWeight="bold" sx={{ marginLeft: "5px" }}>
              {commit?.author?.login}
              <Link muted onClick={onClick}>
                <Text fontWeight="normal"> {commit.commit.message.split("\n\n")[0]}</Text>
              </Link>
            </Text>
          </Truncate>
          <a className="relativeTime" href={commit.html_url} target="_blank">
            <RelativeTime datetime={commit.commit.author?.date} format="auto" />
          </a>
        </>
      ) : (
        <Box className={blober?.blob} width={"100%"} height={20} bg="fg.default" opacity={0.03} />
      )}
    </Box>
  );
}
