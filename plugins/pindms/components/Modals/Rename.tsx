import { common, components } from "replugged";
import { ModalProps } from "replugged/dist/renderer/modules/common/modal";
import pluginSettings from "../../pluginSettings";
import { useState } from "react";
import { CATEGORY_UPDATE } from "../../constants";

const { ModalRoot, ModalContent, ModalHeader } = components.Modal;

export default ({ id, ...props }: ModalProps & { id: string }) => {
  const categories = pluginSettings.get("categories", []);
  const category = categories.find((category) => category.id === id)!;
  const [name, setName] = useState(category.name);

  return (
    <ModalRoot {...props}>
      <ModalHeader>
        <components.Text>Category Name</components.Text>
      </ModalHeader>
      <ModalContent>
        <components.TextInput value={name} onChange={(value) => setName(value)} />
        <components.Button
          onClick={() => {
            category.name = name;
            pluginSettings.set("categories", categories);
            common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });
            void props.onClose();
          }}>
          Save
        </components.Button>
      </ModalContent>
    </ModalRoot>
  );
};
