import { components, operations } from "@octokit/openapi-types";
import { Avatar, Label, Text, Timeline } from "@primer/react";
import { CommitIcon, EyeIcon, TagIcon } from "@primer/styled-octicons";
import { TimelineComment } from "./Comment";

type Props = {
  event: operations["issues/list-events-for-timeline"]["responses"]["200"]["content"]["application/json"][0] & {
    commit?: components["schemas"]["commit"];
  };
};

const items = {
  labeled: Labeled,
  commented: Commented,
  committed: Committed,
  reviewed: {
    commented: ReviewComment,
  },
};

export default ({ event }: Props) => {
  const item = event.event && items[event.event as keyof typeof items];
  const Item = typeof item === "object" ? item[event.state as keyof typeof item] : item;
  if (Item) return <Item event={event} />;
  else return null;
};

function ReviewComment({ event }: Props) {
  return (
    <>
      <Timeline.Item sx={{ marginLeft: "70px" }}>
        <Timeline.Badge>
          <EyeIcon />
        </Timeline.Badge>
      </Timeline.Item>
      <TimelineComment caret="top-left" comment={event} />
    </>
  );
}

function Committed({ event }: Props) {
  return (
    <Timeline.Item sx={{ marginLeft: "70px" }} condensed>
      <Timeline.Badge>
        <CommitIcon />
      </Timeline.Badge>
      <Timeline.Body>
        <Avatar src={event.commit!.author!.avatar_url} /> <Text>{event.message!}</Text>
      </Timeline.Body>
    </Timeline.Item>
  );
}

function Commented({ event }: Props) {
  return <TimelineComment comment={event} />;
}

function Labeled({ event }: Props) {
  return (
    <Timeline.Item sx={{ marginLeft: "70px", display: "flex", alignItems: "center" }}>
      <Timeline.Badge>
        <TagIcon />
      </Timeline.Badge>
      <Timeline.Body>
        <Avatar src={event.actor!.avatar_url} /> <Text fontWeight="bold">{event.actor!.login}</Text>{" "}
        <Text>added</Text>{" "}
        <Label sx={{ borderColor: `#${event.label!.color}`, color: `#${event.label!.color}` }}>
          {event.label!.name}
        </Label>
      </Timeline.Body>
    </Timeline.Item>
  );
}
