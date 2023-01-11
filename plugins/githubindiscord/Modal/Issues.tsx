import { operations } from "@octokit/openapi-types";
import {
  Box,
  Heading,
  Label,
  LabelGroup,
  Link,
  RelativeTime,
  StateLabel,
  Text,
  Timeline,
} from "@primer/react";
import {
  CommentIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  SkipFillIcon,
} from "@primer/styled-octicons";
import { useEffect, useState } from "react";
import { TabProps } from ".";
import { getTimeline } from "../utils";
import { TimelineComment } from "./Comment";
import Spinner from "./Spinner";
import TimelineItems from "./TimelineItems";

export default ({ issues, url }: TabProps) => {
  const [selectedIssue, setIssue] = useState<TabProps["issues"]["all"][0] | null>(null);

  if (selectedIssue) return <Issue issue={selectedIssue} url={url} />;

  return (
    <Box borderColor="border.default" borderStyle="solid" borderWidth={1} borderRadius={2}>
      {!issues.open.length ? (
        <Heading sx={{ p: 4, textAlign: "center" }}>There aren't any open issues</Heading>
      ) : (
        issues.open.map((issue, i) => (
          <Box
            borderColor="border.default"
            borderStyle="solid"
            borderTopWidth={i ? 1 : 0}
            px={3}
            py={2}
            sx={{ ":hover": { bg: "canvas.subtle" } }}
            display="flex">
            {issue.state === "open" ? (
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
                  sx={{ ml: 1, mr: 1, color: "fg.default" }}
                  onClick={() => setIssue(issue)}>
                  {issue.title}
                </Link>
                <LabelGroup>
                  {issue.labels.map((label) => (
                    <Label
                      sx={{
                        borderColor:
                          (typeof label !== "string" && label.color && `#${label.color}`) || null,
                        color:
                          (typeof label !== "string" && label.color && `#${label.color}`) || null,
                      }}>
                      {typeof label === "string" ? label : label.name}
                    </Label>
                  ))}
                </LabelGroup>
              </Box>
              <Box display="flex" alignItems="center">
                <Text fontSize="small" color="fg.muted">
                  #{issue.number} opened <RelativeTime datetime={issue.created_at} /> by{" "}
                  {issue.user!.login}
                </Text>
              </Box>
            </Box>
            <Box>
              <CommentIcon />
              <Text fontSize="small">{issue.comments}</Text>
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
};

function Issue({ issue, url }: { issue: TabProps["issues"]["all"][0]; url: string }) {
  const [timeline, setTimeline] = useState<
    | operations["issues/list-events-for-timeline"]["responses"]["200"]["content"]["application/json"]
    | null
  >(null);

  useEffect(() => {
    (async () => setTimeline(await getTimeline(url, issue.number)))();
  }, []);

  if (!timeline) return <Spinner>Fetching Issue...</Spinner>;

  return (
    <Box>
      <Box mb={3}>
        <Heading>
          {issue.title} #{issue.number}
        </Heading>
        <Box
          display="flex"
          alignItems="center"
          borderBottomWidth={1}
          borderStyle="solid"
          borderColor="border.default"
          pb={2}>
          <StateLabel
            status={issue.state === "closed" ? "issueClosed" : "issueOpened"}
            sx={{ mr: 2, mb: 2 }}>
            {issue.state === "closed" ? "Closed" : "Open"}
          </StateLabel>
          <Text>
            {issue.user?.login} opened this issue <RelativeTime datetime={issue.created_at} /> ·{" "}
            {issue.comments} comments
          </Text>
        </Box>
      </Box>
      <Timeline clipSidebar>
        <TimelineComment comment={issue} />
        {timeline?.map((t) => (
          <TimelineItems event={t} />
        ))}
      </Timeline>
    </Box>
  );
}
