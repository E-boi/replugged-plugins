import { common, components } from "replugged";
import pluginSettings from "../../pluginSettings";
import { CATEGORY_UPDATE } from "../../constants";
import Rename from "../Modals/Rename";

const { ContextMenu } = components;

export default ({ id }: { id: string }) => {
  const categories = pluginSettings.get("categories", []);
  const category = categories.find((category) => category.id === id)!;

  return (
    <ContextMenu.ContextMenu navId="pindms-category" onClose={() => common.contextMenu.close()}>
      {category.position < categories.length && (
        <ContextMenu.MenuItem
          id="pindms-move-down"
          label="Move Down"
          action={() => {
            categories.find((cat) => cat.position === category.position + 1)!.position--;
            category.position += 1;

            pluginSettings.set("categories", categories);

            common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });
          }}
        />
      )}
      {category.position <= categories.length && category.position != 1 && (
        <ContextMenu.MenuItem
          id="pindms-move-up"
          label="Move Up"
          action={() => {
            categories.find((cat) => cat.position === category.position - 1)!.position++;
            category.position -= 1;

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
    </ContextMenu.ContextMenu>
  );
};
