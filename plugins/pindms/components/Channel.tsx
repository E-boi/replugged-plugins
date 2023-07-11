import { DirectMessage, GroupDM } from ".";
import { ChannelStore } from "../stores";

export default ({ id, selected }: { id: string; selected: boolean }) => {
  if (!ChannelStore) return null;

  const channel = ChannelStore.getChannel(id);
  if (!channel || !GroupDM || !DirectMessage) return null;

  if (channel.type === 3) return <GroupDM channel={channel} selected={selected} />;
  else return <DirectMessage channel={channel} selected={selected} />;
};
