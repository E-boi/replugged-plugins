import { common, components } from "replugged";
import pluginSettings from "../../pluginSettings";
import { CATEGORY_UPDATE } from "../../constants";

const { ContextMenu } = components;

export default ({ selectedId }: { selectedId: string }) => {
  const categories = pluginSettings.get("categories", []);

  return (
    <ContextMenu.ContextMenu navId="pindms-categories" onClose={() => common.contextMenu.close()}>
      {categories
        .filter((c) => c.name)
        .map((c) => (
          <ContextMenu.MenuItem
            id={`id-${c.id}`}
            label={c.name}
            action={() => {
              c.ids.push(selectedId);
              pluginSettings.set("categories", categories);
              common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });
            }}
          />
        ))}
    </ContextMenu.ContextMenu>
  );
};
