import { Avatar, Box, PointerBox, RelativeTime, Text } from "@primer/react";
import { BetterSystemStyleObject } from "@primer/react/lib/sx";
import { webpack } from "replugged";

const parser: any = webpack.getByProps("parse", "parseTopic");

export default ({ comment, sx }: { comment: any; sx?: BetterSystemStyleObject }) => (
  <Box sx={sx}>
    {comment.user && (
      <Avatar src={comment.user?.avatar_url} size={40} sx={{ position: "absolute" }} />
    )}
    <PointerBox
      caret="left-top"
      p="10px"
      ml="50px"
      borderColor="border.subtle"
      borderWidth={2}
      borderBottomLeftRadius={0}
      borderBottomRightRadius={0}
      bg="border.default">
      <Text>
        {comment.user?.login} commented <RelativeTime datetime={comment.created_at} />
      </Text>
    </PointerBox>
    <Box
      p="8px"
      ml="50px"
      borderColor="border.subtle"
      borderWidth={2}
      borderStyle="solid"
      borderTop={0}>
      {parser.defaultRules.codeBlock.react({ content: comment.body, lang: "md" }, null, {})}
    </Box>
  </Box>
);
