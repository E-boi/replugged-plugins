import { common, components } from "replugged";
import pluginSettings from "../../pluginSettings";
import { CATEGORY_UPDATE } from "../../constants";
import Rename from "../Modals/Rename";

const { ContextMenu } = components;

export default ({ id }: { id: string }) => {
  const categories = pluginSettings.get("categories", []);
  const index = categories.findIndex((category) => category.id === id);

  return (
    <ContextMenu.ContextMenu navId="pindms-category" onClose={() => common.contextMenu.close()}>
      {index <= categories.length && index != 0 && (
        <ContextMenu.MenuItem
          id="pindms-move-up"
          label="Move Up"
          action={() => {
            const category = categories.splice(index, 1)[0];
            categories.splice(index - 1, 0, category);
            pluginSettings.set("categories", categories);
            common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });
          }}
        />
      )}
      {index < categories.length - 1 && (
        <ContextMenu.MenuItem
          id="pindms-move-down"
          label="Move Down"
          action={() => {
            const category = categories.splice(index, 1)[0];
            categories.splice(index + 1, 0, category);
            pluginSettings.set("categories", categories);
            common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });
          }}
        />
      )}
      <ContextMenu.MenuItem
        id="pindms-rename"
        label="Rename"
        action={() => common.modal.openModal((props) => <Rename {...props} id={id} />)}
      />
      <ContextMenu.MenuItem
        id="pindms-delete"
        label="Delete"
        color="danger"
        action={() => {
          categories.splice(index, 1);
          pluginSettings.set("categories", categories);
          common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });
        }}
      />
    </ContextMenu.ContextMenu>
  );
};
