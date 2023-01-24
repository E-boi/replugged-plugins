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
  CommitIcon,
  FileDiffIcon,
  GitPullRequestIcon,
} from "@primer/styled-octicons";
import { useContext, useEffect, useState } from "react";
import { Context } from "../context";
import { useTimeline } from "../paginate";
import { Issue, TreeWithContent, getPR, getPrFiles } from "../utils";
import { TimelineComment } from "./Comment";
import CommitHistory from "./Commits/CommitHistory";
import CommitsView from "./Commits/CommitView";
import CommitView from "./Commits/Commit";
import IssueCard from "./IssueCard";
import Spinner from "./Spinner";
import TimelineItems from "./TimelineItems";

export default () => {
  const { data } = useContext(Context)!;
  const { prs } = data!;
  const [selectedPr, setPr] = useState<Issue | null>(null);

  const page: Issue[] =
    prs.data![prs.data!.state][prs.info[prs.data!.state]!.data!.pageInfo.currentPage - 1];
  if (selectedPr) return <PR pr={selectedPr} onClose={() => setPr(null)} />;

  return (
    <Box borderColor="border.default" borderStyle="solid" borderWidth={1} borderRadius={2}>
      <Box bg="canvas.subtle" display="flex" p={2} borderTopLeftRadius={2} borderTopRightRadius={2}>
        <Button
          leadingIcon={GitPullRequestIcon}
          variant="invisible"
          sx={{ color: prs.data?.state === "open" ? "fg.default" : "fg.muted" }}
          onClick={() => prs.viewOpen()}>
          {prs.data?.totalOpen} Open
        </Button>
        <Button
          leadingIcon={CheckIcon}
          variant="invisible"
          sx={{ color: prs.data?.state === "closed" ? "fg.default" : "fg.muted" }}
          onClick={() => prs.viewClosed()}>
          {prs.data?.totalClosed} Closed
        </Button>
      </Box>
      {!page?.length ? (
        <Heading sx={{ p: 4, textAlign: "center" }}>There aren't any open pull requests</Heading>
      ) : (
        page?.map((pr) => <IssueCard issue={pr} onClick={() => setPr(pr)} />)
      )}
      {prs.info[prs.data!.state].data?.pageInfo.lastPage && (
        <Box borderColor="border.default" borderStyle="solid" borderTopWidth={1}>
          <Pagination
            currentPage={prs.info[prs.data!.state].data!.pageInfo.currentPage}
            pageCount={prs.info[prs.data!.state].data!.pageInfo.lastPage!}
            showPages={false}
            onPageChange={(_, page) => {
              if (page > prs.info[prs.data!.state].data!.pageInfo.currentPage) prs.nextPage();
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
  { title: "Commits", component: CommitsTab, icon: CommitIcon },
  { title: "Files", component: FilesTab, icon: FileDiffIcon },
];

function PR({ pr, onClose }: { pr: Issue; onClose: () => void }) {
  const { url } = useContext(Context)!.data!;
  const [tab, setTab] = useState("Conversations");
  const timeline = useTimeline(url, pr.number);
  const forceUpdate = useState({})[1];

  useEffect(() => {
    (async () => {
      pr.pull ??= await getPR(url, pr.number);
      forceUpdate({});
    })();
  }, []);

  if (!timeline.data.page) return <Spinner>Fetching Pull Request...</Spinner>;
  const Tab = tabs.find(({ title }) => title === tab);

  return (
    <Box onMouseUp={(event) => event.button === 2 && event.detail === 2 && onClose()}>
      <Box mb={3}>
        <Heading sx={{ display: "flex", alignItems: "center" }}>
          {pr.title} #{pr.number}
          <Button sx={{ ml: 2 }} onClick={onClose}>
            Close
          </Button>
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
      {Tab && <Tab.component {...{ pr, timeline }} />}
    </Box>
  );
}

function ConversationsTab({
  pr,
  timeline,
}: {
  pr: Issue;
  timeline: ReturnType<typeof useTimeline>;
}) {
  const [commit, setCommit] = useState<TreeWithContent["latestCommit"] | null>(null);

  if (commit) return <CommitsView commit={commit} onClose={() => setCommit(null)} />;
  return (
    <Timeline clipSidebar>
      <TimelineComment comment={pr} />
      {timeline.data?.page?.map((t) => (
        <TimelineItems event={{ ...t, issue: pr, onCommitClick: setCommit }} />
      ))}
      {timeline.data.info?.lastPage &&
        timeline.data.info?.currentPage !== timeline.data.info.lastPage && (
          <Button onClick={timeline.nextPage}>Load More</Button>
        )}
    </Timeline>
  );
}

function CommitsTab({ pr }: { pr: Issue }) {
  return <CommitHistory pr={pr.pull} />;
}

function FilesTab({ pr }: { pr: Issue }) {
  const { url } = useContext(Context)!.data!;
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
