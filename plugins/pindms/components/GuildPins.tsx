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
  ReadStateStore,
  StatusStore,
  TypingStore,
} from "../stores";

const classes = webpack.getByProps<{ listItem: string; listItemWrapper: string; pill: string }>(
  "listItem",
  "listItemWrapper",
  "pill",
);

const useStateFromStoreRaw = await webpack.waitForModule(
  webpack.filters.bySource("useStateFromStores"),
);

const useStateFromStore: (<T>(stores: Store[], callback: () => unknown) => T) | undefined =
  webpack.getFunctionBySource(useStateFromStoreRaw as ObjectExports, "useStateFromStores");

const transtionRaw = webpack.getBySource('"transitionTo - Transitioning to "');

const transitionTo = (transtionRaw &&
  webpack.getFunctionBySource(
    transtionRaw as ObjectExports,
    '"transitionTo - Transitioning to "',
  )!) as ((to: string) => void) | undefined;

function GuildPin({ id }: { id: string }) {
  if (
    // !useStateFromStore ||
    !ChannelStore ||
    !ReadStateStore ||
    !StatusStore ||
    !TypingStore ||
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

  const [, drop] = useDrop<Channel>(() => ({
    accept: "GUILDPIN",
    drop: (item, monitor) => {
      if (item.id == id) return;
      const pins = pluginSettings.get("guildPins", []);
      const draggedIndex = pins.findIndex((pin) => pin === item.id);
      const droppedIndex = pins.findIndex((pin) => pin === id);

      if (draggedIndex == -1 || droppedIndex == -1) return;

      pluginSettings.set(
        "guildPins",
        pins.map((pin, index) => {
          if (index === draggedIndex) return id;
          else if (index === droppedIndex) return item.id;

          return pin;
        }),
      );

      common.fluxDispatcher.dispatch({ type: GUILDLIST_UPDATE });
    },
  }));

  const [, drag] = useDrag(() => ({
    type: "GUILDPIN",
    item: channel,
    options: { dropEffect: "copy" },
  }));
  const [hovered, setHovered] = useState(false);
  const isMobileOnline = common.flux.useStateFromStores<boolean>([StatusStore], () =>
    StatusStore!.isMobileOnline(user.id),
  );
  const status = common.flux.useStateFromStores<string>([StatusStore], () =>
    StatusStore!.getStatus(user.id),
  );
  const unreadCount = common.flux.useStateFromStores<number>([ReadStateStore], () =>
    ReadStateStore!.getUnreadCount(channel.id),
  );
  const isTyping = common.flux.useStateFromStores<boolean>([TypingStore], () =>
    TypingStore!.isTyping(channel.id, user.id),
  );

  const showStatus = pluginSettings.get("showStatus", true);

  return (
    <components.Tooltip shouldShow={hovered} text={getChannelName(channel)} position="right">
      <div
        ref={(node) => drop(drag(node))}
        className={[
          classes?.listItem,
          "pindms-guildlist-pin",
          channel.type === 1 ? null : "pindms-guildlist-pin-group",
        ].join(" ")}>
        {Pill ? (
          <Pill
            className={classes?.pill}
            selected={false}
            hovered={hovered}
            unread={Boolean(unreadCount)}
          />
        ) : undefined}
        <div>
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
          {Badge && (unreadCount ?? 0) > 0 ? <Badge count={unreadCount} /> : undefined}
        </div>
      </div>
    </components.Tooltip>
  );
}

export default () => {
  const [guildPins, setGuildPins] = useState(pluginSettings.get("guildPins", [] as string[]));

  useEffect(() => {
    const update = () => {
      setGuildPins([]);
      setTimeout(() => setGuildPins([...pluginSettings.get("guildPins", [])]));
    };

    common.fluxDispatcher.subscribe(GUILDLIST_UPDATE, update);
    return () => common.fluxDispatcher.unsubscribe(GUILDLIST_UPDATE, update);
  }, []);

  return (
    <>
      {guildPins.map((id) => (
        <GuildPin id={id} />
      ))}
    </>
  );
};
