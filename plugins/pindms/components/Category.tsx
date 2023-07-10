import { common, webpack } from "replugged";
import pluginSettings, { Category } from "../pluginSettings";
import Channel from "./Channel";
import Popout from "./Popout";
import { CATEGORY_UPDATE } from "../constants";
import CategoryContextMenu from "./contextMenus/Category";
import type {
  ConnectDragPreview,
  ConnectDragSource,
  DragSourceHookSpec,
  DropTargetHookSpec,
  FactoryOrInstance,
} from "react-dnd";

const classes = webpack.getByProps<Record<string, string>>(
  "privateChannelsHeaderContainer",
  "privateChannelRecipientsInviteButtonIcon",
  "headerText",
);

const { lastMessageId }: { lastMessageId: (id: string) => number } =
  webpack.getByProps("lastMessageId")!;

type UseDrag<DragObject = unknown, DropResult = unknown, CollectedProps = unknown> = (
  specArg: FactoryOrInstance<DragSourceHookSpec<DragObject, DropResult, CollectedProps>>,
  deps?: unknown[],
) => [CollectedProps, ConnectDragSource, ConnectDragPreview];

const useDragRaw = webpack.getBySource(
  "useDrag::spec.begin was deprecated in v14. Replace spec.begin() with spec.item(). (see more here - https://react-dnd.github.io/react-dnd/docs/api/use-drag)",
);
const useDrag: UseDrag<Category> = webpack.getFunctionBySource(
  useDragRaw,
  "useDrag::spec.begin was deprecated in v14. Replace spec.begin() with spec.item(). (see more here - https://react-dnd.github.io/react-dnd/docs/api/use-drag)",
)!;

type UseDrop<DragObject = unknown, DropResult = unknown, CollectedProps = unknown> = (
  specArg: FactoryOrInstance<DropTargetHookSpec<DragObject, DropResult, CollectedProps>>,
  deps?: unknown[],
) => [CollectedProps, ConnectDragSource, ConnectDragPreview];

const useDropRaw = webpack.getBySource("accept must be defined");
const useDrop: UseDrop<Category> = webpack.getFunctionBySource(useDropRaw, "disconnectDropTarget")!;

console.log(useDrop);
console.log(useDrag);

export default ({ category, selected }: { category: Category; selected: string }) => {
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

      common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });

      console.log(draggedIndex, droppedIndex, item.name, category.name);
    },
  }));

  const [, drag] = useDrag(() => ({
    type: "BOX",
    item: category,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
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
            .sort((a, b) => lastMessageId(b) - lastMessageId(a))
            .map((id) => <Channel id={id} selected={id === selected} />)}
    </div>
  );
};
