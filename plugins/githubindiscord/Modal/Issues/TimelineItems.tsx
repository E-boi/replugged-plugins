import { operations } from "@octokit/openapi-types";
import { Avatar, Label, Text, Timeline } from "@primer/react";
import { TagIcon } from "@primer/styled-octicons";
import Comment from "./Comment";

type Props = {
  event: operations["issues/list-events-for-timeline"]["responses"]["200"]["content"]["application/json"][0];
};

const items = { labeled: Labeled, commented: Commented };

export default ({ event }: Props) => {
  const Item = event.event && items[event.event as keyof typeof items];
  if (Item) return <Item event={event} />;
  else return null;
};

function Commented({ event }: Props) {
  return (
    <>
      <Comment comment={event} />
      <Timeline.Item sx={{ marginLeft: "60px" }} />
    </>
  );
}

function Labeled({ event }: Props) {
  return (
    <Timeline.Item sx={{ marginLeft: "60px", display: "flex", alignItems: "center" }}>
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
