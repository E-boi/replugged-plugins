import { Avatar, Box, RelativeTime, Text } from "@primer/react";
import { useEffect, useState } from "react";
import { TreeWithContent, getCommit } from "../../utils";
import Spinner from "../Spinner";
import CommitView from "./CommitView";

export default ({
  commit,
  url,
}: {
  commit: NonNullable<TreeWithContent["latestCommit"]>;
  url: string;
}) => {
  const forceUpdate = useState({})[1];

  useEffect(() => {
    if (commit.files) return;
    (async () => {
      const ccommit = await getCommit(url, commit!.sha);
      commit.files = ccommit.files;
      commit.stats = ccommit.stats;
      forceUpdate({});
    })();
  }, []);

  if (!commit.files) return <Spinner>Fetching Commit</Spinner>;

  const message = commit.commit.message.split("\n\n");
  console.log(commit);

  return (
    <Box>
      <Box borderStyle="solid" borderWidth={1} borderColor="border.default" borderRadius={2} mb={3}>
        <Box bg="canvas.subtle" p={3} borderTopLeftRadius={2} borderTopRightRadius={2}>
          <Text as="p" m={0}>
            {message[0]}
          </Text>
          {message[1] && <Text fontSize={14}>{message[1]}</Text>}
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
      {commit.files!.map((file) => (
        <CommitView commit={file} sx={{ mb: 3 }} />
      ))}
    </Box>
  );
};
