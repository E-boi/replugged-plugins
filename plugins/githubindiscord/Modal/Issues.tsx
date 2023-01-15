import {
  Box,
  Button,
  Heading,
  Label,
  LabelGroup,
  Link,
  Pagination,
  RelativeTime,
  StateLabel,
  Text,
  Timeline,
} from "@primer/react";
import {
  CheckIcon,
  CommentIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  SkipFillIcon,
} from "@primer/styled-octicons";
import { useEffect, useState } from "react";
import { TabProps } from ".";
import { Issue, getMarkdown, getTimeline } from "../utils";
import { TimelineComment } from "./Comment";
import Spinner from "./Spinner";
import TimelineItems from "./TimelineItems";

export default ({ issues, url }: TabProps) => {
  const [selectedIssue, setIssue] = useState<Issue | null>(null);

  const page: Issue[] = issues.page[issues.state][issues.info.currentPage - 1];
  if (selectedIssue) return <Issue issue={selectedIssue} url={url} />;

  return (
    <Box borderColor="border.default" borderStyle="solid" borderWidth={1} borderRadius={2}>
      <Box bg="canvas.subtle" display="flex" p={2} borderTopLeftRadius={2} borderTopRightRadius={2}>
        <Button
          leadingIcon={IssueOpenedIcon}
          variant="invisible"
          sx={{ color: issues.state === "open" ? "fg.default" : "fg.muted" }}
          onClick={() => issues.viewOpen()}>
          {issues.page.totalOpen} Open
        </Button>
        <Button
          leadingIcon={CheckIcon}
          variant="invisible"
          sx={{ color: issues.state === "closed" ? "fg.default" : "fg.muted" }}
          onClick={() => issues.viewClosed()}>
          {issues.page.totalClosed} Closed
        </Button>
      </Box>
      {!page.length ? (
        <Heading sx={{ p: 4, textAlign: "center" }}>There aren't any open issues</Heading>
      ) : (
        page.map((issue) => (
          <Box
            borderColor="border.subtle"
            borderStyle="solid"
            borderTopWidth={1}
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
      {issues.info.pages[issues.state] && (
        <Box borderColor="border.default" borderStyle="solid" borderTopWidth={1}>
          <Pagination
            currentPage={issues.info.currentPage}
            pageCount={issues.info.pages[issues.state]!.last}
            showPages={false}
            onPageChange={(_, page) => {
              if (page > issues.info.currentPage) issues.nextPage();
              else issues.previousPage();
            }}
          />
        </Box>
      )}
    </Box>
  );
};

function Issue({ issue, url }: { issue: Issue; url: string }) {
  const forceUpdate = useState({})[1];
  useEffect(() => {
    (async () => {
      if (!issue.timeline) issue.timeline = await getTimeline(url, issue.number);
      const markdown = issue.marked
        ? issue.body
        : await getMarkdown(issue.body ?? "*No description provided.*");
      issue.body = markdown;
      issue.marked = true;
      forceUpdate({});
    })();
  }, []);

  if (!issue.timeline) return <Spinner>Fetching issue...</Spinner>;

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
          pb={3}>
          <StateLabel
            status={issue.state === "closed" ? "issueClosed" : "issueOpened"}
            sx={{ mr: 2 }}>
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
        {issue.timeline?.map((t) => (
          <TimelineItems event={t} />
        ))}
      </Timeline>
    </Box>
  );
}
