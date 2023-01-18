import {
  Box,
  BranchName,
  Button,
  Heading,
  Pagination,
  StateLabel,
  TabNav,
  Text,
  Timeline,
} from "@primer/react";
import {
  CheckIcon,
  CommentDiscussionIcon,
  FileDiffIcon,
  GitPullRequestIcon,
} from "@primer/styled-octicons";
import { useContext, useEffect, useState } from "react";
import { TabProps } from ".";
import { Context } from "../context";
import { Issue, TreeWithContent, getMarkdown, getPR, getPrFiles, getTimeline } from "../utils";
import { TimelineComment } from "./Comment";
import CommitsView from "./Commits/CommitsView";
import CommitView from "./Commits/CommitView";
import IssueCard from "./IssueCard";
import Spinner from "./Spinner";
import TimelineItems from "./TimelineItems";

export default ({ url }: TabProps) => {
  const { data } = useContext(Context)!;
  const { prs } = data!;
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

const tabs = [
  {
    title: "Conversations",
    component: ConversationsTab,
    icon: CommentDiscussionIcon,
  },
  { title: "Files", component: FilesTab, icon: FileDiffIcon },
];

function PR({ pr, url }: { pr: Issue; url: string }) {
  const forceUpdate = useState({})[1];
  const [tab, setTab] = useState("Conversations");

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
  const Tab = tabs.find(({ title }) => title === tab);

  return (
    <Box>
      <Box mb={3}>
        <Heading>
          {pr.title} #{pr.number}
        </Heading>
        <Box display="flex" alignItems="center" pb={3}>
          <StateLabel
            status={
              pr.state === "closed" ? (pr.pull?.merged ? "pullMerged" : "pullClosed") : "pullOpened"
            }
            sx={{ mr: 2 }}>
            {pr.state === "closed" ? (pr.pull?.merged ? "Merged" : "Closed") : "Open"}
          </StateLabel>
          <Text>
            {pr.pull?.merged_by?.login || pr.user?.login}{" "}
            {pr.pull?.merged ? "merged" : "wants to merge"} {pr.pull?.commits} into{" "}
            <BranchName>{pr.pull?.base.label}</BranchName> from{" "}
            <BranchName>{pr.pull?.head.label}</BranchName>
          </Text>
        </Box>
        <TabNav>
          {tabs.map((t) => (
            <TabNav.Link selected={t.title === tab} onClick={() => setTab(t.title)}>
              <t.icon /> {t.title}
            </TabNav.Link>
          ))}
        </TabNav>
      </Box>
      {Tab && <Tab.component {...{ pr, url }} />}
    </Box>
  );
}

function ConversationsTab({ pr, url }: { pr: Issue; url: string }) {
  const [commit, setCommit] = useState<TreeWithContent["latestCommit"] | null>(null);

  if (commit) return <CommitsView commit={commit} url={url} />;
  return (
    <Timeline clipSidebar>
      <TimelineComment comment={pr} />
      {pr.timeline?.map((t) => (
        <TimelineItems event={{ ...t, issue: pr, onCommitClick: (commit) => setCommit(commit) }} />
      ))}
    </Timeline>
  );
}

function FilesTab({ pr, url }: { pr: Issue; url: string }) {
  const forceUpdate = useState({})[1];

  useEffect(() => {
    (async () => {
      pr.files ??= await getPrFiles(url, pr.number);
      forceUpdate({});
    })();
  }, []);

  if (!pr.files) return <Spinner>Fetching files...</Spinner>;

  return (
    <>
      {pr.files.map((p) => (
        <CommitView commit={p} sx={{ marginBottom: 3 }} />
      ))}
    </>
  );
}
