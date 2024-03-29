import { common, components } from "replugged";
import pluginSettings from "../../pluginSettings";
import { CATEGORY_UPDATE, GUILDLIST_UPDATE } from "../../constants";

const { ContextMenu } = components;

export default ({ selectedId, inMenu }: { selectedId: string; inMenu?: boolean }) => {
  const categories = pluginSettings.get("categories", []);
  let guildPins: string[] = pluginSettings.get("guildPins", []);
  const inCategory = categories.some((c) => c.ids.includes(selectedId));
  const category = categories.find((c) => c.ids.includes(selectedId));

  const contextMenu = (
    <>
      {inCategory ? (
        <ContextMenu.MenuItem
          id="id-remove"
          label={`Unpin from "${category?.name}"`}
          color="danger"
          action={() => {
            const idx = categories.findIndex((c) => c.ids.includes(selectedId));

            categories[idx].ids = categories[idx].ids.filter((i) => i !== selectedId);

            pluginSettings.set("categories", categories);
            common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });
          }}
        />
      ) : (
        <ContextMenu.MenuGroup>
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
        </ContextMenu.MenuGroup>
      )}
      <ContextMenu.MenuSeparator />
      {guildPins.includes(selectedId) ? (
        <ContextMenu.MenuItem
          id="guildlist-remove"
          color="danger"
          label="Unpin From Server List"
          action={() => {
            guildPins = guildPins.filter((g) => g !== selectedId);
            pluginSettings.set("guildPins", guildPins);
            common.fluxDispatcher.dispatch({ type: GUILDLIST_UPDATE });
          }}
        />
      ) : (
        <ContextMenu.MenuItem
          id="id-pindm"
          label="Pin To Server List"
          action={() => {
            guildPins.push(selectedId);
            pluginSettings.set("guildPins", guildPins);
            common.fluxDispatcher.dispatch({ type: GUILDLIST_UPDATE });
          }}
        />
      )}
    </>
  );

  if (inMenu)
    return (
      <ContextMenu.MenuItem id="pindms-menu" label="PinDMs">
        {contextMenu}
      </ContextMenu.MenuItem>
    );

  return (
    <ContextMenu.ContextMenu navId="pindms-channel" onClose={() => common.contextMenu.close()}>
      {contextMenu}
    </ContextMenu.ContextMenu>
  );
};
