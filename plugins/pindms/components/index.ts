import { FC, ReactElement } from "react";
import { webpack } from "replugged";
import { ModuleExports, ObjectExports } from "replugged/dist/types";

export interface User {
  username: string;
  id: string;
  getAvatarURL(): string;
}

export interface Channel {
  type: number;
  rawRecipients: Array<Omit<User, "getAvatarURL">>;
  name: string;
  id: string;
  lastMessageId: string;
}

export const RawDirectMessage: ObjectExports = webpack.getBySource('["channel","selected"]')!;

export const DirectMessageKey = webpack.getFunctionKeyBySource(
  RawDirectMessage,
  /hasUnreadMessages:\w,canUseAvatarDecorations/,
)!;

export const DirectMessage = RawDirectMessage[DirectMessageKey] as React.FC<{
  channel: Channel;
  selected: boolean;
}>;

export const GroupDM = webpack.getFunctionBySource<
  React.FC<{ channel: Channel; selected: boolean }>
>(webpack.getBySource('["channel","selected"]')!, /hasUnreadMessages:\w,isFavorite/)!;

export const RawPrivateChannel: ObjectExports = webpack.getBySource(/children\)\(\w+\(\w+\.id/)!;

export const PrivateChannelKey = webpack.getFunctionKeyBySource(
  RawPrivateChannel,
  /children\)\(\w+\(\w+\.id/,
)!;

export const PrivateChannel = RawPrivateChannel[PrivateChannelKey];

export const {
  Popout: DPopout,
}: {
  Popout: FC<{
    children: () => ReactElement;
    shouldShow: boolean;
    onRequestClose: () => void;
    renderPopout: () => ReactElement;
  }>;
} = webpack.getByProps("Popout")!;

export const SearchBar = webpack.getBySource(
  '"query","autoFocus","onClear","className","placeholder","iconClassName","onKeyDown","onKeyUp","onKeyPress","isLoading","size","disabled","onChange","onBlur","onFocus","autoComplete","inputProps","aria-label"',
)! as FC<{
  className: string;
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
}>;
