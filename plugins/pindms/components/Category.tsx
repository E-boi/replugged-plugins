import { common, webpack } from "replugged";
import pluginSettings, { Category } from "../pluginSettings";
import Channel from "./Channel";
import Popout from "./Popout";
import { CATEGORY_UPDATE } from "../constants";
import CategoryContextMenu from "./contextMenus/Category";
import { useDrag, useDrop } from ".";
import { ReadStateStore } from "../stores";

const classes = webpack.getByProps<Record<string, string>>(
  "privateChannelsHeaderContainer",
  "privateChannelRecipientsInviteButtonIcon",
  "headerText",
);

// console.log(useDrop);
// console.log(useDrag);

export default ({ category, selected }: { category: Category; selected: string }) => {
  if (!ReadStateStore || !useDrop || !useDrag) return null;

  const [, drop] = useDrop(() => ({
    accept: "BOX",
    drop: (item: Category, _) => {
      let categories = pluginSettings.get("categories", []);
      const draggedIndex = categories.findIndex((cat) => cat.id === item.id);
      const droppedIndex = categories.findIndex((cat) => cat.id === category.id);

      categories = categories.map((cat, index) => {
        if (index === draggedIndex) return category;
        else if (index === droppedIndex) return item;

        return cat;
      });

      pluginSettings.set("categories", categories);

      common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE, refresh: true });
    },
  }));

  const [, drag] = useDrag(() => ({
    type: "BOX",
    item: category,
  }));

  return (
    <div>
      <div ref={(node) => drag(drop(node))}>
        <h2
          ref={drag}
          className={[classes?.privateChannelsHeaderContainer, "pindms-container"].join(" ")}
          onContextMenu={(e) =>
            common.contextMenu.open(e, () => <CategoryContextMenu id={category.id} />)
          }
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
      </div>
      {category.collapsed
        ? category.ids
            .filter((i) => selected === i)
            .map((id) => <Channel id={id} selected={true} />)
        : category.ids
            .sort((a, b) => ReadStateStore!.lastMessageId(b) - ReadStateStore!.lastMessageId(a))
            .map((id) => <Channel id={id} selected={id === selected} />)}
    </div>
  );
};
