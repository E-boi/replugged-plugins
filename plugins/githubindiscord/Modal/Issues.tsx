import {
  Box,
  Button,
  Heading,
  Pagination,
  RelativeTime,
  StateLabel,
  Text,
  Timeline,
} from "@primer/react";
import { CheckIcon, IssueOpenedIcon } from "@primer/styled-octicons";
import { useContext, useEffect, useState } from "react";
import { Context } from "../context";
import { useTimeline } from "../paginate";
import { Issue, getIssue } from "../utils";
import { TimelineComment } from "./Comment";
import IssueCard from "./IssueCard";
import Spinner from "./Spinner";
import TimelineItems from "./TimelineItems";
import { operations } from "@octokit/openapi-types";

export default () => {
  const { issues, link } = useContext(Context)!;
  const [selectedIssue, setIssue] = useState<Issue | null>(null);

  // useEffect(() => {
  //   void issues.fetch();
  // }, []);

  useEffect(() => {
    console.log("rin");
    if (link.issuenumber) {
      const num = Number.parseInt(link.issuenumber!);

      console.log(num);

      getIssue(link.url, num).then((issue) => setIssue(issue as Issue));
    }
  }, []);

  if (!issues.data) return <Spinner>Fetching Issues...</Spinner>;

  const page: Issue[] =
    issues.data[issues.data.state][issues.info[issues.data.state]!.data!.pageInfo.currentPage - 1];
  if (selectedIssue) return <Issue issue={selectedIssue} onClose={() => setIssue(null)} />;

  return (
    <Box borderColor="border.default" borderStyle="solid" borderWidth={1} borderRadius={2}>
      <Box bg="canvas.subtle" display="flex" p={2} borderTopLeftRadius={2} borderTopRightRadius={2}>
        <Button
          leadingIcon={IssueOpenedIcon}
          variant="invisible"
          sx={{ color: issues.data.state === "open" ? "fg.default" : "fg.muted" }}
          onClick={() => issues.viewOpen()}>
          {issues.data.totalOpen} Open
        </Button>
        <Button
          leadingIcon={CheckIcon}
          variant="invisible"
          sx={{ color: issues.data.state === "closed" ? "fg.default" : "fg.muted" }}
          onClick={() => issues.viewClosed()}>
          {issues.data.totalClosed} Closed
        </Button>
      </Box>
      {!page?.length ? (
        <Heading sx={{ p: 4, textAlign: "center" }}>There aren't any open issues</Heading>
      ) : (
        page?.map((issue) => <IssueCard issue={issue} onClick={() => setIssue(issue)} />)
      )}
      {issues.info[issues.data.state].data?.pageInfo.lastPage && (
        <Box borderColor="border.default" borderStyle="solid" borderTopWidth={1} tabIndex={-1}>
          <Pagination
            currentPage={issues.info[issues.data.state].data!.pageInfo.currentPage}
            pageCount={issues.info[issues.data.state].data!.pageInfo.lastPage!}
            showPages={false}
            onPageChange={(_, page) => {
              if (page > issues.info[issues.data!.state].data!.pageInfo.currentPage)
                issues.nextPage();
              else issues.previousPage();
            }}
          />
        </Box>
      )}
    </Box>
  );
};

function Issue({ issue, onClose }: { issue: Issue; onClose: () => void }) {
  const { data } = useContext(Context)!;
  const timeline = useTimeline(data!.repo.full_name, issue.number);

  if (!timeline.data.info) return <Spinner>Fetching issue...</Spinner>;

  return (
    <Box onMouseUp={(event) => event.button === 2 && event.detail === 2 && onClose()}>
      <Box mb={3}>
        <Heading sx={{ display: "flex", alignItems: "center" }}>
          {issue.title} #{issue.number}
          <Button sx={{ ml: 2 }} onClick={onClose}>
            Close
          </Button>
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
        {timeline.data.page?.map((t) => (
          <TimelineItems
            event={{
              ...(t as operations["issues/list-events-for-timeline"]["responses"]["200"]["content"]["application/json"][0]),
              issue,
            }}
          />
        ))}
        {timeline.data.info?.lastPage &&
          timeline.data.info?.currentPage !== timeline.data.info.lastPage && (
            <Button onClick={timeline.nextPage} sx={{ mt: 2 }}>
              Load More
            </Button>
          )}
      </Timeline>
    </Box>
  );
}
