import { common, components } from "replugged";
import Categories from "./contextMenus/Categories";
import pluginSettings from "../pluginSettings";
import { CATEGORY_UPDATE } from "../constants";

export default ({ selectedId }: { selectedId: string }) => {
  return (
    <components.Tooltip text="Pin/Unpin" position="top">
      <svg
        viewBox="0 0 24 24"
        height={16}
        width={16}
        style={{ paddingRight: "8px" }}
        onClick={(e) => {
          const cats = pluginSettings.get("categories", []);
          const idx = cats.findIndex((c) => c.ids.includes(selectedId));

          // @ts-expect-error bad typings
          if (idx == -1) common.contextMenu.open(e, () => <Categories selectedId={selectedId} />);
          else {
            cats[idx].ids = cats[idx].ids.filter((id) => id != selectedId);

            pluginSettings.set("categories", cats);
            common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });
          }
        }}>
        <path
          fill="currentColor"
          d="M22 12L12.101 2.10101L10.686 3.51401L12.101 4.92901L7.15096 9.87801V9.88001L5.73596 8.46501L4.32196 9.88001L8.56496 14.122L2.90796 19.778L4.32196 21.192L9.97896 15.536L14.222 19.778L15.636 18.364L14.222 16.95L19.171 12H19.172L20.586 13.414L22 12Z"
        />
      </svg>
    </components.Tooltip>
  );
};
