import { Avatar, Box, Button, RelativeTime, Text } from "@primer/react";
import { useContext, useEffect } from "react";
import { Context } from "../../context";
import { TreeWithContent, getCommit } from "../../utils";
import Spinner from "../Spinner";
import CommitView from "./Commit";

export default ({
  commit,
  onClose,
}: {
  commit: NonNullable<TreeWithContent["commit"]>;
  onClose: () => void;
}) => {
  const { data, updated } = useContext(Context)!;

  useEffect(() => {
    if (commit.files) return;
    (async () => {
      const ccommit = await getCommit(data!.repo.full_name, commit.sha);
      commit.files = ccommit.files;
      commit.stats = ccommit.stats;
      updated();
    })();
  }, []);

  if (!commit.files) return <Spinner>Fetching Commit...</Spinner>;

  const message = commit.commit.message.split("\n\n");

  return (
    <Box onMouseUp={(event) => event.button === 2 && event.detail === 2 && onClose()}>
      <Box borderStyle="solid" borderWidth={1} borderColor="border.default" borderRadius={2} mb={3}>
        <Box bg="canvas.subtle" p={3} borderTopLeftRadius={2} borderTopRightRadius={2}>
          <Text as="p" m={0} display="flex" sx={{ alignItems: "center" }}>
            {message[0]}
            <Button sx={{ ml: 2 }} onClick={onClose}>
              Close
            </Button>
          </Text>
          {message[1] && <pre>{message[1]}</pre>}
        </Box>
        <Box borderStyle="solid" borderTop={1} borderColor="border.subtle" px={3} py={2}>
          <Avatar src={commit.author!.avatar_url} />{" "}
          <Text fontWeight="bold">{commit.author?.login}</Text> <Text>commited</Text>{" "}
          <RelativeTime datetime={commit.commit.author?.date} />
        </Box>
      </Box>
      <Box mb={3}>
        <Text>Showing</Text>{" "}
        <Text fontWeight="bold">
          {commit.files.length} changed file{commit.files.length > 1 ? "s" : ""}
        </Text>{" "}
        <Text>with</Text> <Text fontWeight="bold">{commit.stats?.additions} additions</Text>{" "}
        <Text>and</Text> <Text fontWeight="bold">{commit.stats?.deletions} deletions</Text>
      </Box>
      {commit.files.map((file) => (
        <CommitView commit={file} sx={{ mb: 3 }} />
      ))}
    </Box>
  );
};
