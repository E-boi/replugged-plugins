import { common, components, webpack } from "replugged";
import pluginSettings from "../pluginSettings";
import { useEffect, useState } from "react";
import { GUILDLIST_UPDATE } from "../constants";
import { getChannelIcon, getChannelName, getUser } from "../utils";
import { Avatar, Badge, BlobMask, Pill } from ".";
import { ObjectExports } from "replugged/dist/types";
import Categories from "./contextMenus/Channel";
import { Store } from "replugged/dist/renderer/modules/common/flux";
import { ChannelStore, ReadStateStore, StatusStore, TypingStore } from "../stores";

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
  if (!useStateFromStore || !ChannelStore || !ReadStateStore || !StatusStore || !TypingStore)
    return null;

  const channel = ChannelStore.getChannel(id);
  const user = channel && getUser(channel.recipients[0]);

  if (!channel || !user) return null;

  const [hovered, setHovered] = useState(false);
  const isMobileOnline = useStateFromStore<boolean>([StatusStore], () =>
    StatusStore!.isMobileOnline(user.id),
  );
  const status = useStateFromStore<string>([StatusStore], () => StatusStore!.getStatus(user.id));
  const unreadCount = useStateFromStore<number>([ReadStateStore], () =>
    ReadStateStore!.getUnreadCount(channel.id),
  );
  const isTyping = useStateFromStore<boolean>([TypingStore], () =>
    TypingStore!.isTyping(channel.id, user.id),
  );

  return (
    <components.Tooltip shouldShow={hovered} text={getChannelName(channel)} position="right">
      <div
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
        <BlobMask
          upperBadge={
            Badge && (unreadCount ?? 0) > 0 ? <Badge count={unreadCount} /> : <span></span>
          }>
          <Avatar
            isMobile={isMobileOnline}
            isTyping={isTyping}
            size="SIZE_40"
            src={getChannelIcon(channel)!}
            status={channel.type === 1 ? status : undefined}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => transitionTo?.(`/channels/@me/${id}`)}
            onContextMenu={(e) =>
              common.contextMenu.open(e, () => <Categories selectedId={channel.id} />)
            }
            className={`pindms-guildlist-avatar ${
              channel.type === 1 ? null : "pindms-guildlist-pin-group"
            }`}
          />
        </BlobMask>
      </div>
    </components.Tooltip>
  );
}

export default () => {
  const [guildPins, setGuildPins] = useState(pluginSettings.get("guildPins", [] as string[]));

  useEffect(() => {
    const update = () => {
      setGuildPins([...pluginSettings.get("guildPins", [])]);
    };

    common.fluxDispatcher.subscribe(GUILDLIST_UPDATE, update);
    return () => common.fluxDispatcher.unsubscribe(GUILDLIST_UPDATE, update);
  });

  return (
    <>
      {guildPins.map((id) => (
        <GuildPin id={id} />
      ))}
    </>
  );
};
