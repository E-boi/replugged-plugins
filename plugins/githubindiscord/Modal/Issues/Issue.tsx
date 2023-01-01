import { components, operations } from "@octokit/openapi-types";
import { Box, Heading, Text, Timeline } from "@primer/react";
import { useEffect, useState } from "react";
import { getTimeline } from "../../utils";
import Comment from "./Comment";
import TimelineItems from "./TimelineItems";

export default ({ issue, url }: { issue: components["schemas"]["issue"]; url: string }) => {
  const [timeline, setTimeline] = useState<
    | operations["issues/list-events-for-timeline"]["responses"]["200"]["content"]["application/json"]
    | null
  >(null);

  useEffect(() => {
    (async () => setTimeline(await getTimeline(url, issue.number)))();
  }, []);

  return (
    <Timeline>
      <Box sx={{ marginTop: "10px" }}>
        <Heading>
          {issue.title} <Text>#{issue.number}</Text>
        </Heading>
        <Comment comment={issue} sx={{ marginTop: "10px" }} />
      </Box>
      {timeline?.map((t) => (
        <TimelineItems event={t} />
      ))}
    </Timeline>
  );
};
