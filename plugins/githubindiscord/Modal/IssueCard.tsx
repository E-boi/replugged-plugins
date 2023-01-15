import { Box, Label, LabelGroup, Link, RelativeTime, Text } from "@primer/react";
import {
  CommentIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  SkipFillIcon,
} from "@primer/styled-octicons";
import { Issue } from "../utils";

export default ({ issue, onClick }: { issue: Issue; onClick: () => void }) => (
  <Box
    borderColor="border.subtle"
    borderStyle="solid"
    borderTopWidth={1}
    px={3}
    py={2}
    sx={{ ":hover": { bg: "canvas.subtle" } }}
    display="flex">
    {issue.pull_request ? (
      issue.state === "open" ? (
        issue.draft ? (
          <GitPullRequestDraftIcon />
        ) : (
          <GitPullRequestIcon color="open.fg" />
        )
      ) : (
        <GitPullRequestClosedIcon color="closed.fg" />
      )
    ) : issue.state === "open" ? (
      <IssueOpenedIcon color="open.fg" />
    ) : issue.state_reason === "not_planned" ? (
      <SkipFillIcon color="fg.muted" />
    ) : (
      <IssueClosedIcon color="done.fg" />
    )}
    <Box display="flex" alignItems="baseline" flexDirection="column" flex="auto">
      <Box>
        <Link
          muted
          sx={{ ml: 1, mr: 1, color: "fg.default", ":hover": { color: "accent.fg" } }}
          onClick={onClick}>
          {issue.title}
        </Link>
        <LabelGroup>
          {issue.labels.map((label) => (
            <Label
              sx={{
                borderColor:
                  (typeof label !== "string" && label.color && `#${label.color}`) || null,
                color: (typeof label !== "string" && label.color && `#${label.color}`) || null,
              }}>
              {typeof label === "string" ? label : label.name}
            </Label>
          ))}
        </LabelGroup>
      </Box>
      <Box display="flex" alignItems="center">
        <Text fontSize="small" color="fg.muted">
          #{issue.number} opened <RelativeTime datetime={issue.created_at} /> by {issue.user!.login}
        </Text>
      </Box>
    </Box>
    <Box>
      <CommentIcon />
      <Text fontSize="small">{issue.comments}</Text>
    </Box>
  </Box>
);
