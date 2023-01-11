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
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
} from "@primer/styled-octicons";
import { useEffect, useState } from "react";
import { TabProps } from ".";
import { getTimeline } from "../utils";
import { TimelineComment } from "./Comment";
import Spinner from "./Spinner";
import TimelineItems from "./TimelineItems";

export default ({ prs, url }: TabProps) => {
  const [selectedPr, setPr] = useState<TabProps["prs"]["all"][0] | null>(null);

  if (selectedPr) return <PR pr={selectedPr} url={url} />;

  return (
    <Box borderColor="border.default" borderStyle="solid" borderWidth={1} borderRadius={2}>
      {!prs.open.length ? (
        <Heading sx={{ p: 4, textAlign: "center" }}>There aren't any open pull requests</Heading>
      ) : (
        prs.open.map((pr, i) => (
          <Box
            borderColor="border.default"
            borderStyle="solid"
            borderTopWidth={i ? 1 : 0}
            px={3}
            py={2}
            sx={{ ":hover": { bg: "canvas.subtle" } }}
            display="flex">
            {pr.state === "open" ? (
              pr.draft ? (
                <GitPullRequestDraftIcon />
              ) : (
                <GitPullRequestIcon color="open.fg" />
              )
            ) : (
              <GitPullRequestClosedIcon color="closed.fg" />
            )}
            <Box display="flex" alignItems="baseline" flexDirection="column" flex="auto">
              <Box>
                <Link muted sx={{ ml: 1, mr: 1, color: "fg.default" }} onClick={() => setPr(pr)}>
                  {pr.title}
                </Link>
                <LabelGroup>
                  {pr.labels.map((label) => (
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
                  #{pr.number} opened <RelativeTime datetime={pr.created_at} /> by {pr.user!.login}
                </Text>
              </Box>
            </Box>
            <Box>
              <CommentIcon />
              <Text fontSize="small">{pr.comments}</Text>
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
};

function PR({ pr, url }: { pr: TabProps["prs"]["all"][0]; url: string }) {
  const [timeline, setTimeline] = useState<
    | operations["issues/list-events-for-timeline"]["responses"]["200"]["content"]["application/json"]
    | null
  >(null);

  useEffect(() => {
    (async () => setTimeline(await getTimeline(url, pr.number)))();
  }, []);

  if (!timeline) return <Spinner>Fetching Pull Request...</Spinner>;

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
          pb={2}>
          <StateLabel
            status={pr.state === "closed" ? "pullClosed" : "pullOpened"}
            sx={{ mr: 2, mb: 2 }}>
            {pr.state === "closed" ? "Closed" : "Open"}
          </StateLabel>
          <Text>
            {pr.user?.login} opened this issue <RelativeTime datetime={pr.created_at} /> ·{" "}
            {pr.comments} comments
          </Text>
        </Box>
      </Box>
      <Timeline clipSidebar>
        <TimelineComment comment={pr} />
        {timeline?.map((t) => (
          <TimelineItems event={t} />
        ))}
      </Timeline>
    </Box>
  );
}
