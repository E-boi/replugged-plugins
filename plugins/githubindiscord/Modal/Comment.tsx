import { Avatar, Box, CaretProps, PointerBox, RelativeTime, Text, Timeline } from "@primer/react";
import { BetterSystemStyleObject } from "@primer/react/lib/sx";
import Markdown from "./Markdown";

export const TimelineComment = ({
  comment,
  caret,
  sx,
}: {
  // ill type later
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comment: any;
  caret?: CaretProps["location"];
  sx?: BetterSystemStyleObject;
}) => {
  return (
    <Timeline.Item sx={{ marginLeft: "70px" }}>
      {comment.user && (
        <Avatar
          src={comment.user?.avatar_url}
          size={40}
          sx={{ position: "absolute", left: "-72px" }}
        />
      )}
      <Timeline.Body sx={{ maxWidth: "100%", flex: "auto", mt: 0 }}>
        <Box
          sx={sx}
          ml={-3}
          position="relative"
          color="fg.default"
          backgroundColor="canvas.default">
          <PointerBox
            caret={caret ?? "left"}
            px={3}
            py={2}
            borderColor="border.default"
            borderWidth={1}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            bg="canvas.subtle">
            <Text>
              {comment.user?.login} commented <RelativeTime datetime={comment.created_at} />
            </Text>
          </PointerBox>
          <Markdown
            source={comment.body ?? "*No description provided.*"}
            sx={{
              p: 3,
              borderColor: "border.default",
              borderWidth: 1,
              borderStyle: "solid",
              borderTop: 0,
              borderBottomLeftRadius: 2,
              borderBottomRightRadius: 2,
            }}
          />
        </Box>
      </Timeline.Body>
    </Timeline.Item>
  );
};
