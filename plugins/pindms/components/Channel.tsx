import { PrivateChannel } from ".";
import { ChannelStore } from "../stores";

export default ({ id, selected }: { id: string; selected: boolean }) => {
  if (!ChannelStore || !PrivateChannel) return null;

  const channel = ChannelStore.getChannel(id);

  if (!channel) return null;

  return <PrivateChannel channel={channel} selected={selected} />;

  // if (channel.type === 3) return <GroupDM channel={channel} selected={selected} />;
  // else return <DirectMessage channel={channel} selected={selected} />;
};
