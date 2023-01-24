import { components, operations } from "@octokit/openapi-types";
import { Avatar, Label, Link, RelativeTime, Text, Timeline } from "@primer/react";
import {
  CommitIcon,
  EyeIcon,
  FileDiffIcon,
  GitMergeIcon,
  IssueClosedIcon,
  PencilIcon,
  PersonIcon,
  PinIcon,
  SkipFillIcon,
  TagIcon,
} from "@primer/styled-octicons";
import { Issue } from "../utils";
import { TimelineComment } from "./Comment";

interface Props {
  event: operations["issues/list-events-for-timeline"]["responses"]["200"]["content"]["application/json"][0] & {
    commit?: components["schemas"]["commit"];
    issue: Issue;
    onCommitClick?: (commit: components["schemas"]["commit"]) => void;
  };
}

const items = {
  labeled: Labeled,
  unlabeled: Unlabeled,
  commented: Commented,
  committed: Committed,
  closed: Closed,
  assigned: Assigned,
  unassigned: Unassigned,
  renamed: Renamed,
  pinned: Pinned,
  unpinned: Unpinned,
  reviewed: {
    commented: ReviewComment,
    approved: ReviewComment,
    changes_requested: ChangesRequested,
  },
};

export default ({ event }: Props) => {
  // console.log(event);
  const item = event.event && items[event.event as keyof typeof items];
  const Item = typeof item === "object" ? item[event.state as keyof typeof item] : item;
  if (Item) return <Item event={event} />;
  else return null;
};

function Unpinned({ event }: Props) {
  return (
    <Timeline.Item sx={{ marginLeft: "70px" }}>
      <Timeline.Badge>
        <PinIcon />
      </Timeline.Badge>
      <Timeline.Body>
        <Avatar src={event.actor!.avatar_url} /> <Text fontWeight="bold">{event.actor!.login}</Text>{" "}
        <Text>unpinned this issue</Text> <RelativeTime datetime={event.created_at} />
      </Timeline.Body>
    </Timeline.Item>
  );
}

function Pinned({ event }: Props) {
  return (
    <Timeline.Item sx={{ marginLeft: "70px" }}>
      <Timeline.Badge>
        <PinIcon />
      </Timeline.Badge>
      <Timeline.Body>
        <Avatar src={event.actor!.avatar_url} /> <Text fontWeight="bold">{event.actor!.login}</Text>{" "}
        <Text>pinned this issue</Text> <RelativeTime datetime={event.created_at} />
      </Timeline.Body>
    </Timeline.Item>
  );
}

function Renamed({ event }: Props) {
  return (
    <Timeline.Item sx={{ marginLeft: "70px" }}>
      <Timeline.Badge>
        <PencilIcon />
      </Timeline.Badge>
      <Timeline.Body>
        <Avatar src={event.actor!.avatar_url} /> <Text fontWeight="bold">{event.actor!.login}</Text>{" "}
        <Text>changed the title</Text>{" "}
        <Text as="del" fontWeight="bold">
          {event.rename!.from}
        </Text>{" "}
        <Text fontWeight="bold">{event.rename!.to}</Text>{" "}
        <RelativeTime datetime={event.created_at} />
      </Timeline.Body>
    </Timeline.Item>
  );
}

function Assigned({ event }: Props) {
  return (
    <Timeline.Item sx={{ marginLeft: "70px" }}>
      <Timeline.Badge>
        <PersonIcon />
      </Timeline.Badge>
      <Timeline.Body>
        <Avatar src={event.actor!.avatar_url} /> <Text fontWeight="bold">{event.actor!.login}</Text>{" "}
        {event.actor?.login === event.assignee?.login ? (
          <Text>self-assigned </Text>
        ) : (
          <>
            <Text>assigned</Text> <Text fontWeight="bold">{event.assignee!.login}</Text>{" "}
          </>
        )}
        <RelativeTime datetime={event.created_at} />
      </Timeline.Body>
    </Timeline.Item>
  );
}

function Unassigned({ event }: Props) {
  return (
    <Timeline.Item sx={{ marginLeft: "70px" }}>
      <Timeline.Badge>
        <PersonIcon />
      </Timeline.Badge>
      <Timeline.Body>
        <Avatar src={event.actor!.avatar_url} /> <Text fontWeight="bold">{event.actor!.login}</Text>{" "}
        <Text>unassigned</Text> <Text fontWeight="bold">{event.assignee!.login}</Text>{" "}
        <RelativeTime datetime={event.created_at} />
      </Timeline.Body>
    </Timeline.Item>
  );
}

function Closed({ event }: Props) {
  const reason = event.state_reason;
  return (
    <>
      <Timeline.Item sx={{ marginLeft: "70px" }}>
        <Timeline.Badge sx={(!reason && { bg: "done.emphasis" }) || undefined}>
          {event.issue.pull?.merged ? (
            <GitMergeIcon color="fg.onEmphasis" />
          ) : reason === "not_planned" ? (
            <SkipFillIcon color="fg.muted" />
          ) : (
            <IssueClosedIcon color="fg.onEmphasis" />
          )}
        </Timeline.Badge>
        <Timeline.Body>
          <Avatar src={event.actor!.avatar_url} />{" "}
          <Text fontWeight="bold">{event.actor!.login}</Text>{" "}
          <Text>
            {event.issue.pull?.merged
              ? `merged commit ${event.issue.pull.merge_commit_sha?.slice(0, 7)} into ${
                  event.issue.pull.base.label
                }`
              : `Closed this ${
                  reason === "not_planned"
                    ? "as not planned"
                    : event.issue.pull
                    ? ""
                    : "as completed"
                }`}
          </Text>{" "}
          <RelativeTime datetime={event.created_at} />
        </Timeline.Body>
      </Timeline.Item>
      <Timeline.Break />
    </>
  );
}

function ChangesRequested({ event }: Props) {
  if (!event.body) return null;
  return (
    <>
      <Timeline.Item sx={{ marginLeft: "70px" }}>
        <Timeline.Badge sx={{ bg: "danger.emphasis", color: "fg.onEmphasis" }}>
          <FileDiffIcon />
        </Timeline.Badge>
        <Timeline.Body>
          <Avatar src={event.user!.login} /> <Text fontWeight="bold">{event.user?.login}</Text>{" "}
          <Text>requested changes</Text> <RelativeTime datetime={event.submitted_at} />
        </Timeline.Body>
      </Timeline.Item>
      <TimelineComment caret="top-left" comment={event} />
    </>
  );
}

function ReviewComment({ event }: Props) {
  if (!event.body) return null;
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
        <Avatar src={event.commit!.author!.avatar_url} />{" "}
        <Link muted onClick={() => event.onCommitClick?.(event.commit!)}>
          {event.message?.split("\n\n")[0]}
        </Link>
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
        </Label>{" "}
        <Text>label</Text> <RelativeTime datetime={event.created_at} />
      </Timeline.Body>
    </Timeline.Item>
  );
}

function Unlabeled({ event }: Props) {
  return (
    <Timeline.Item sx={{ marginLeft: "70px", display: "flex", alignItems: "center" }}>
      <Timeline.Badge>
        <TagIcon />
      </Timeline.Badge>
      <Timeline.Body>
        <Avatar src={event.actor!.avatar_url} /> <Text fontWeight="bold">{event.actor!.login}</Text>{" "}
        <Text>removed</Text>{" "}
        <Label sx={{ borderColor: `#${event.label!.color}`, color: `#${event.label!.color}` }}>
          {event.label!.name}
        </Label>{" "}
        <Text>label</Text> <RelativeTime datetime={event.created_at} />
      </Timeline.Body>
    </Timeline.Item>
  );
}
