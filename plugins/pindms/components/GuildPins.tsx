import { common, components, webpack } from "replugged";
import pluginSettings from "../pluginSettings";
import { useEffect, useState } from "react";
import { GUILDLIST_UPDATE } from "../constants";
import { getChannelIcon, getChannelName, getUser } from "../utils";
import { Avatar, Badge, BlobMask, Channel, Pill, useDrag, useDrop } from ".";
import { ObjectExports } from "replugged/dist/types";
import Categories from "./contextMenus/Channel";
import { Store } from "replugged/dist/renderer/modules/common/flux";

import {
  ChannelStore,
  GuildChannelStore,
  SelectedChannelStore,
  ReadStateStore,
  StatusStore,
  TypingStore,
  ApplicationStreamingStore,
  ChannelRTCStore,
  RTCConnectionStore,
} from "../stores";

const classes = webpack.getByProps<{ listItem: string; listItemWrapper: string; pill: string }>(
  "listItem",
  "listItemWrapper",
  "pill",
);

/* const useStateFromStoreRaw = await webpack.waitForModule(
  webpack.filters.bySource("useStateFromStores"),
); */

/* const useStateFromStore: (<T>(stores: Store[], callback: () => unknown) => T) | undefined =
  webpack.getFunctionBySource(useStateFromStoreRaw as ObjectExports, "useStateFromStores"); */

const transtionRaw = webpack.getBySource('"transitionTo - Transitioning to "');

const transitionTo = (transtionRaw &&
  webpack.getFunctionBySource(
    transtionRaw as ObjectExports,
    '"transitionTo - Transitioning to "',
  )!) as ((to: string) => void) | undefined;

function DropEndWrapper({ id }: { id: string }) {
  if (!useDrop) return null;

  const [{ isOver }, drop] = useDrop<Channel>({
    accept: "GUILDPIN",
    drop: (item, monitor) => {
      if (item.id == id) return;
      const pins = pluginSettings.get("guildPins", []);
      const draggedIndex = pins.findIndex((pin) => pin === item.id);
      const droppedIndex = pins.findIndex((pin) => pin === id);

      if (draggedIndex == -1 || droppedIndex == -1) return;

      pluginSettings.set(
        "guildPins",
        pins.reduce((acc: string[], item, index) => {
          if (index === draggedIndex) return acc;
          if (index === droppedIndex) return [...acc, item, pins[draggedIndex]];
          return [...acc, item];
        }, []),
      );

      common.fluxDispatcher.dispatch({ type: GUILDLIST_UPDATE });
    },
    collect: (e) => ({
      isOver: e.isOver(),
    }),
  });

  return (
    <span
      className={isOver ? "pindms-guildList-dragTarget" : ""}
      ref={(node) => drop(node)}
      style={{ padding: "10% 0% 10% 100%", zIndex: "99", position: "absolute" }}
    />
  );
}

function GuildPin({ id }: { id: string }) {
  if (
    // !useStateFromStore ||
    !ChannelStore ||
    !ReadStateStore ||
    !StatusStore ||
    !TypingStore ||
    !SelectedChannelStore ||
    !ApplicationStreamingStore ||
    !ChannelRTCStore ||
    !RTCConnectionStore ||
    !useDrop ||
    !useDrag ||
    !Pill ||
    !BlobMask ||
    !Avatar
  )
    return null;

  const channel = ChannelStore.getChannel(id);
  const user = channel && getUser(channel.recipients[0]);

  if (!channel || !user) return null;

  const [{ isOver }, drop] = useDrop<Channel>({
    accept: "GUILDPIN",
    drop: (item, monitor) => {
      if (item.id == id) return;
      const pins = pluginSettings.get("guildPins", []);
      const draggedIndex = pins.findIndex((pin) => pin === item.id);
      const droppedIndex = pins.findIndex((pin) => pin === id);

      if (draggedIndex == -1 || droppedIndex == -1) return;

      pluginSettings.set(
        "guildPins",
        pins.reduce((acc: string[], item, index) => {
          if (index === draggedIndex) return acc;
          if (index === droppedIndex) return [...acc, pins[draggedIndex], item];
          return [...acc, item];
        }, []),
      );

      common.fluxDispatcher.dispatch({ type: GUILDLIST_UPDATE });
    },
    collect: (e) => ({
      isOver: e.isOver(),
    }),
  });

  const [{ dragging }, drag] = useDrag({
    type: "GUILDPIN",
    item: channel,
    options: { dropEffect: "copy" },
    collect: (e) => ({
      dragging: e.isDragging(),
    }),
  });
  const [hovered, setHovered] = useState(false);
  const isMobileOnline = common.flux.useStateFromStores<boolean>([StatusStore], () =>
    StatusStore!.isMobileOnline(user.id),
  );
  const status = common.flux.useStateFromStores<string>([StatusStore], () =>
    StatusStore!.getStatus(user.id),
  );
  const unreadCount = common.flux.useStateFromStores<number>(
    [ReadStateStore],
    () => ReadStateStore!.getUnreadCount(channel.id) || ReadStateStore!.getMentionCount(channel.id),
  );
  const isTyping = common.flux.useStateFromStores<boolean>([TypingStore], () =>
    TypingStore!.isTyping(channel.id, user.id),
  );
  const selected = common.flux.useStateFromStores<boolean>(
    [SelectedChannelStore],
    () => SelectedChannelStore!.getCurrentlySelectedChannelId() === channel.id,
  );
  const mediaInfo = common.flux.useStateFromStores<{
    video: boolean;
    audio: boolean;
    screenshare: boolean;
    isCurrentUserConnected: boolean;
  }>([ApplicationStreamingStore, ChannelRTCStore, RTCConnectionStore], () => {
    const connectedVoiceChannelId = RTCConnectionStore!.getChannelId();
    const streams = ApplicationStreamingStore?.getAllApplicationStreamsForChannel(id);
    const voiceChannelMode = connectedVoiceChannelId === id ? ChannelRTCStore?.getMode(id) : "";
    return {
      video: voiceChannelMode === "video",
      audio: voiceChannelMode === "voice",
      screenshare: Boolean(streams?.length),
      isCurrentUserConnected: connectedVoiceChannelId === id,
    };
  });

  const showStatus = pluginSettings.get("showStatus", true);

  return (
    <components.Tooltip
      key={`${dragging}`}
      className={!dragging && isOver ? "pindms-guildList-dragTarget" : ""}
      shouldShow={hovered}
      text={getChannelName(channel)}
      position="right">
      <div
        className={[
          "pindms-guildlist-pin",
          channel.type === 1 ? null : "pindms-guildlist-pin-group",
        ].join(" ")}>
        {Pill ? (
          <Pill
            className={"pindms-guildlist-pill"}
            selected={selected}
            hovered={!dragging && hovered}
            unread={Boolean(unreadCount)}
          />
        ) : undefined}
        <span
          ref={(node) => drop(drag(node))}
          style={{
            transform: "translate(0, 0)",
          }}>
          {!dragging && (
            <>
              <Avatar
                isMobile={isMobileOnline}
                isTyping={isTyping}
                size="SIZE_48"
                src={getChannelIcon(channel)!}
                status={channel.type === 1 && showStatus ? status : undefined}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => transitionTo?.(`/channels/@me/${id}`)}
                onContextMenu={(e) =>
                  common.contextMenu.open(e, () => <Categories selectedId={channel.id} />)
                }
              />
              {Badge && (unreadCount ?? 0) > 0
                ? Badge.renderMentionBadge!(unreadCount)
                : Badge?.renderMediaBadge!(mediaInfo)}
            </>
          )}
        </span>
      </div>
    </components.Tooltip>
  );
}

export default () => {
  const [guildPins, setGuildPins] = useState(pluginSettings.get("guildPins", [] as string[]));
  const [key, setKey] = useState(Date.now());
  useEffect(() => {
    const update = () => {
      setGuildPins([...pluginSettings.get("guildPins", [])]);
      setKey(Date.now());
    };

    common.fluxDispatcher.subscribe(GUILDLIST_UPDATE, update);
    return () => common.fluxDispatcher.unsubscribe(GUILDLIST_UPDATE, update);
  }, [pluginSettings.get("guildPins", [] as string[])]);

  return (
    <span key={key}>
      {guildPins.map((id, index) => (
        <GuildPin id={id} key={`${id}-${index}`} />
      ))}
      <DropEndWrapper id={guildPins[guildPins.length - 1]} />
    </span>
  );
};
