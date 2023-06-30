import { FC, ReactElement } from "react";
import { webpack } from "replugged";
import { AnyFunction, ObjectExports } from "replugged/dist/types";

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
  recipients: string[];
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
>(RawDirectMessage, /hasUnreadMessages:\w,isFavorite/)!;

export const RawPrivateChannel: ObjectExports = webpack.getBySource(/children\)\(\w+\(\w+\.id/)!;

export const PrivateChannelKey = webpack.getFunctionKeyBySource(
  RawPrivateChannel,
  /children\)\(\w+\(\w+\.id/,
)!;

export const PrivateChannel = RawPrivateChannel[PrivateChannelKey];

interface AvatarProps {
  src: string;
  size: string;
  status?: string;
  isTyping: boolean;
  isMobile: boolean;
  className?: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
}

export const {
  Popout: DPopout,
  Avatar,
  BlobMask,
}: {
  Popout: FC<{
    children: () => ReactElement;
    shouldShow: boolean;
    onRequestClose: () => void;
    renderPopout: () => ReactElement;
  }>;
  Avatar: FC<AvatarProps>;
  // AnimatedAvatar: FC<AvatarProps>;
  BlobMask: FC<{ children: ReactElement; lowerBadge?: ReactElement; upperBadge?: ReactElement }>;
} = webpack.getByProps("Popout")!;

const AvatarRaw = webpack.getBySource<{ X: AnyFunction }>('"size","isMobile","isTyping"');

export const StatusBlob = AvatarRaw?.X as FC | undefined;

const BadgeRaw = webpack.getBySource('"count","color","disableColor","shape","className","style"');

export const Badge = (BadgeRaw &&
  webpack.getFunctionBySource(
    BadgeRaw,
    '"count","color","disableColor","shape","className","style"',
  )) as FC<{ count: number }> | undefined;

export const SearchBar = webpack.getBySource<
  FC<{ className: string; query: string; onChange: (value: string) => void; onClear: () => void }>
>(
  '"query","autoFocus","onClear","className","placeholder","iconClassName","onKeyDown","onKeyUp","onKeyPress","isLoading","size","disabled","onChange","onBlur","onFocus","autoComplete","inputProps","aria-label"',
)!;

export const { getChannelIconURL }: { getChannelIconURL: (channel: Channel) => string } =
  webpack.getByProps("getChannelIconURL")!;

export const Pill =
  webpack.getBySource<FC<{ className?: string; selected?: boolean; hovered?: boolean }>>(
    '"pill":"empty"',
  );
