import { common, webpack } from "replugged";
import pluginSettings, { Category } from "../pluginSettings";
import Channel from "./Channel";
import Popout from "./Popout";
import { CATEGORY_UPDATE } from "../constants";

const classes = webpack.getByProps<Record<string, string>>(
  "privateChannelsHeaderContainer",
  "privateChannelRecipientsInviteButtonIcon",
  "headerText",
);

const { lastMessageId }: { lastMessageId: (id: string) => number } =
  webpack.getByProps("lastMessageId")!;

export default ({ category, selected }: { category: Category; selected: string }) => {
  return (
    <div>
      <h2
        className={[classes?.privateChannelsHeaderContainer, "pindms-container"].join(" ")}
        onClick={() => {
          category.collapsed = !category.collapsed;
          pluginSettings.set("categories", pluginSettings.get("categories", []));
          common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });
        }}>
        <span className={classes?.headerText}>{category.name}</span>
        <div
          className={classes?.privateChannelRecipientsInviteButtonIcon}
          style={{ cursor: "pointer" }}>
          <Popout category={category} />
        </div>
      </h2>
      {category.collapsed
        ? category.ids
            .filter((i) => selected === i)
            .map((id) => <Channel id={id} selected={true} />)
        : category.ids
            .sort((a, b) => lastMessageId(b) - lastMessageId(a))
            .map((id) => <Channel id={id} selected={id === selected} />)}
    </div>
  );
};
