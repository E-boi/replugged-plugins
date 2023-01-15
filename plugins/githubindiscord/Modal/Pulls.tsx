import {
  Box,
  BranchName,
  Button,
  Heading,
  Pagination,
  StateLabel,
  Text,
  Timeline,
} from "@primer/react";
import { CheckIcon, GitPullRequestIcon } from "@primer/styled-octicons";
import { useEffect, useState } from "react";
import { TabProps } from ".";
import { Issue, getMarkdown, getPR, getTimeline } from "../utils";
import { TimelineComment } from "./Comment";
import IssueCard from "./IssueCard";
import Spinner from "./Spinner";
import TimelineItems from "./TimelineItems";

export default ({ prs, url }: TabProps) => {
  const [selectedPr, setPr] = useState<Issue | null>(null);

  const page: Issue[] = prs.page[prs.state][prs.info.currentPage - 1];
  if (selectedPr) return <PR pr={selectedPr} url={url} />;

  return (
    <Box borderColor="border.default" borderStyle="solid" borderWidth={1} borderRadius={2}>
      <Box bg="canvas.subtle" display="flex" p={2} borderTopLeftRadius={2} borderTopRightRadius={2}>
        <Button
          leadingIcon={GitPullRequestIcon}
          variant="invisible"
          sx={{ color: prs.state === "open" ? "fg.default" : "fg.muted" }}
          onClick={() => prs.viewOpen()}>
          {prs.page.totalOpen} Open
        </Button>
        <Button
          leadingIcon={CheckIcon}
          variant="invisible"
          sx={{ color: prs.state === "closed" ? "fg.default" : "fg.muted" }}
          onClick={() => prs.viewClosed()}>
          {prs.page.totalClosed} Closed
        </Button>
      </Box>
      {!page?.length ? (
        <Heading sx={{ p: 4, textAlign: "center" }}>There aren't any open pull requests</Heading>
      ) : (
        page?.map((pr) => <IssueCard issue={pr} onClick={() => setPr(pr)} />)
      )}
      {prs.info.pages[prs.state] && (
        <Box borderColor="border.default" borderStyle="solid" borderTopWidth={1}>
          <Pagination
            currentPage={prs.info.currentPage}
            pageCount={prs.info.pages[prs.state]!.last}
            showPages={false}
            onPageChange={(_, page) => {
              if (page > prs.info.currentPage) prs.nextPage();
              else prs.previousPage();
            }}
          />
        </Box>
      )}
    </Box>
  );
};

function PR({ pr, url }: { pr: Issue; url: string }) {
  const forceUpdate = useState({})[1];
  useEffect(() => {
    (async () => {
      if (!pr.timeline) pr.timeline = await getTimeline(url, pr.number);
      if (!pr.pull) pr.pull = await getPR(url, pr.number);
      const markdown = pr.marked
        ? pr.body
        : await getMarkdown(pr.body ?? "*No description provided.*");
      pr.body = markdown;
      pr.marked = true;
      forceUpdate({});
    })();
  }, []);

  if (!pr.timeline) return <Spinner>Fetching pull request...</Spinner>;

  return (
    <Box>
      <Box mb={3}>
        <Heading>
          {pr.title} #{pr.number}
        </Heading>
        <Box
          display="flex"
          alignItems="center"
          borderBottomWidth={1}
          borderStyle="solid"
          borderColor="border.default"
          pb={3}>
          <StateLabel status={pr.state === "closed" ? "pullClosed" : "pullOpened"} sx={{ mr: 2 }}>
            {pr.state === "closed" ? "Closed" : "Open"}
          </StateLabel>
          <Text>
            {pr.user?.login} wants to merge {pr.pull?.commits} into{" "}
            <BranchName>{pr.pull?.base.label}</BranchName> from{" "}
            <BranchName>{pr.pull?.head.label}</BranchName>
          </Text>
        </Box>
      </Box>
      <Timeline clipSidebar>
        <TimelineComment comment={pr} />
        {pr.timeline?.map((t) => (
          <TimelineItems event={t} />
        ))}
      </Timeline>
    </Box>
  );
}
