import { FC, ReactElement } from "react";
import type {
  ConnectDragPreview,
  ConnectDragSource,
  DragSourceHookSpec,
  DropTargetHookSpec,
  FactoryOrInstance,
} from "react-dnd";
import { webpack } from "replugged";
import { AnyFunction, ObjectExports } from "replugged/dist/types";

export interface User {
  username: string;
  global_name?: string;
  display_name?: string;
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

export const RawDirectMessage = webpack.getBySource<ObjectExports>('["channel","selected"]');

export const DirectMessageKey =
  RawDirectMessage &&
  webpack.getFunctionKeyBySource(RawDirectMessage, /hasUnreadMessages:\w,canUseAvatarDecorations/)!;

export const DirectMessage = (RawDirectMessage &&
  DirectMessageKey &&
  RawDirectMessage[DirectMessageKey]) as
  | React.FC<{
      channel: Channel;
      selected: boolean;
    }>
  | undefined;

export const GroupDM =
  RawDirectMessage &&
  webpack.getFunctionBySource<React.FC<{ channel: Channel; selected: boolean }>>(
    RawDirectMessage,
    /hasUnreadMessages:\w,isFavorite/,
  )!;

export const PrivateChannel = webpack.getByProps<{
  default: React.FC<{ channel: Channel; selected: boolean }>;
  CloseButton: React.FC;
  LinkButton: React.FC;
}>(["CloseButton", "LinkButton"])?.default;

export const RawPrivateChannel = webpack.getBySource<ObjectExports>(/children\)\(\w+\(\w+\.id/);

export const PrivateChannelKey =
  RawPrivateChannel &&
  webpack.getFunctionKeyBySource(RawPrivateChannel, /children\)\(\w+\(\w+\.id/);

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
  BlobMask: FC<{ children: ReactElement; lowerBadge?: ReactElement; upperBadge?: ReactElement }>;
} = webpack.getByProps(["Avatar", "Popout", "BlobMask"])!;

const AvatarRaw = webpack.getBySource<{ X: AnyFunction }>('"size","isMobile","isTyping"');

export const StatusBlob = AvatarRaw?.X as FC | undefined;

const BadgeRaw = webpack.getBySource('"count","color","disableColor","shape","className","style"');

export const Badge = webpack.getByProps<{ NumberBadge: FC<{ count: number }> }>(
  "NumberBadge",
)?.NumberBadge;

export const SearchBar = webpack.getBySource<
  FC<{ className: string; query: string; onChange: (value: string) => void; onClear: () => void }>
>(
  '"query","autoFocus","onClear","className","placeholder","iconClassName","onKeyDown","onKeyUp","onKeyPress","isLoading","size","disabled","onChange","onBlur","onFocus","autoComplete","inputProps","aria-label"',
)!;

export const { getChannelIconURL }: { getChannelIconURL: (channel: Channel) => string } =
  webpack.getByProps("getChannelIconURL")!;

export const Pill =
  webpack.getBySource<
    FC<{ className?: string; selected?: boolean; hovered?: boolean; unread?: boolean }>
  >('"pill":"empty"');

// const useDragRaw = webpack.getBySource(
//   "useDrag::spec.begin was deprecated in v14. Replace spec.begin() with spec.item(). (see more here - https://react-dnd.github.io/react-dnd/docs/api/use-drag)",
// );
// export const useDrag = webpack.getFunctionBySource<
//   <DragObject = unknown, DropResult = unknown, CollectedProps = unknown>(
//     specArg: FactoryOrInstance<DragSourceHookSpec<DragObject, DropResult, CollectedProps>>,
//     deps?: unknown[],
//   ) => [CollectedProps, ConnectDragSource, ConnectDragPreview]
// >(
//   useDragRaw,
//   "useDrag::spec.begin was deprecated in v14. Replace spec.begin() with spec.item(). (see more here - https://react-dnd.github.io/react-dnd/docs/api/use-drag)",
// );

// const useDropRaw = webpack.getBySource("accept must be defined");
// export const useDrop = webpack.getFunctionBySource<
//   <DragObject = unknown, DropResult = unknown, CollectedProps = unknown>(
//     specArg: FactoryOrInstance<DropTargetHookSpec<DragObject, DropResult, CollectedProps>>,
//     deps?: unknown[],
//   ) => [CollectedProps, ConnectDragSource, ConnectDragPreview]
// >(useDropRaw, "disconnectDropTarget");

export const {
  useDrag,
  useDrop,
}: {
  useDrop: <DragObject = unknown, DropResult = unknown, CollectedProps = unknown>(
    specArg: FactoryOrInstance<DropTargetHookSpec<DragObject, DropResult, CollectedProps>>,
    deps?: unknown[],
  ) => [CollectedProps, ConnectDragSource, ConnectDragPreview];
  useDrag: <DragObject = unknown, DropResult = unknown, CollectedProps = unknown>(
    specArg: FactoryOrInstance<DragSourceHookSpec<DragObject, DropResult, CollectedProps>>,
    deps?: unknown[],
  ) => [CollectedProps, ConnectDragSource, ConnectDragPreview];
} = webpack.getByProps("useDrag")!;
