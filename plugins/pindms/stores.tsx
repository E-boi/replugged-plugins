import { webpack } from "replugged";
import { Store } from "replugged/dist/renderer/modules/common/flux";
import { Channel } from "./components";

export const StatusStore = webpack.getByStoreName<
  Store & { isMobileOnline: (id: string) => boolean; getStatus: (id: string) => string }
>("PresenceStore");

export const TypingStore = webpack.getByStoreName<
  Store & { isTyping: (channelId: string, userId: string) => boolean }
>("TypingStore");

export const ReadStateStore = webpack.getByStoreName<
  Store & { getUnreadCount: (channelId: string) => number; lastMessageId: (id: string) => number }
>("ReadStateStore");

export const ChannelStore = webpack.getByStoreName<
  Store & { getChannel: (id: string) => Channel; getDMFromUserId: (userId: string) => string }
>("ChannelStore");

export const GuildChannelStore = webpack.getByStoreName<
  Store & { getChannels: (guildId: string) => { SELECTABLE: Array<{ channel: Channel }> } }
>("GuildChannelStore");

export const SelectedChannelStore = webpack.getByStoreName<
  Store & { getCurrentlySelectedChannelId: () => string }
>("SelectedChannelStore");

export const ApplicationStreamingStore = webpack.getByStoreName<
  Store & { getAllApplicationStreamsForChannel: (channelId: string) => unknown[] }
>("ApplicationStreamingStore");

export const ChannelRTCStore = webpack.getByStoreName<
  Store & { getMode: (channelId: string) => string }
>("ChannelRTCStore");

export const RTCConnectionStore = webpack.getByStoreName<Store & { getChannelId: () => string }>(
  "RTCConnectionStore",
);
