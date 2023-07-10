import { common, components, webpack } from "replugged";
import pluginSettings from "../pluginSettings";
import { useEffect, useState } from "react";
import { GUILDLIST_UPDATE } from "../constants";
import { getChannel } from "./Channel";
import { getChannelIcon, getChannelName, getUser } from "../utils";
import { Avatar, Badge, BlobMask, Pill, User } from ".";
import { ObjectExports } from "replugged/dist/types";
import Categories from "./contextMenus/Channel";

const classes = webpack.getByProps<{ listItem: string; listItemWrapper: string; pill: string }>(
  "listItem",
  "listItemWrapper",
  "pill",
);

const ReadStateStore = webpack.getByStoreName("ReadStateStore") as
  | { getUnreadCount: (channelId: string) => number }
  | undefined;

const useStateFromStoreRaw = await webpack.waitForModule(
  webpack.filters.bySource("useStateFromStores"),
);

const useStateFromStore: ((stores: unknown[], callback: () => unknown) => number) | undefined =
  webpack.getFunctionBySource(useStateFromStoreRaw as ObjectExports, "useStateFromStores");

const transtionRaw = webpack.getBySource('"transitionTo - Transitioning to "');

const transitionTo = (transtionRaw &&
  webpack.getFunctionBySource(
    transtionRaw as ObjectExports,
    '"transitionTo - Transitioning to "',
  )!) as ((to: string) => void) | undefined;

const StatusStore:
  | { isMobileOnline: (id: string) => boolean; getStatus: (id: string) => string }
  | undefined = webpack.getByProps("isMobileOnline");

function GuildPin({ id }: { id: string }) {
  if (!useStateFromStore || !ReadStateStore) return null;

  const channel = getChannel(id);

  if (!channel) return null;

  const [hovered, setHovered] = useState(StatusStore?.isMobileOnline(id));
  const [isMobileOnline, setMobileOnline] = useState(false);
  const [status, setStatus] = useState("offline");
  const unreadCount = useStateFromStore([ReadStateStore], () =>
    ReadStateStore.getUnreadCount(channel.id),
  );

  const user = channel && getUser(channel.recipients[0]);

  useEffect(() => {
    if (user && StatusStore) {
      setMobileOnline(StatusStore.isMobileOnline(user.id));
      setStatus(StatusStore.getStatus(user.id));
    }
  }, [JSON.stringify(user)]);

  useEffect(() => {
    const statusUpdate = (data?: { updates: Array<{ user: User }> }) => {
      const update = data?.updates.find((u) => u.user.id === user?.id);
      if (update && StatusStore) {
        setStatus(StatusStore.getStatus(update.user.id));
        setMobileOnline(StatusStore.isMobileOnline(update.user.id));
      }
    };

    // @ts-expect-error types
    common.fluxDispatcher.subscribe("PRESENCE_UPDATES", statusUpdate);

    // @ts-expect-error types
    return () => common.fluxDispatcher.unsubscribe("PRESENCE_UPDATES", statusUpdate);
  }, []);

  if (!channel) return null;

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
            isTyping={false}
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
