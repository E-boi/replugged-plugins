import { common, components } from "replugged";
import { ModalProps } from "../Modals";
import Settings from "../Settings";

const { ModalContent, ModalHeader, ModalRoot, ModalFooter, ModalCloseButton } = components.Modal;
const { FormItem, FormText } = components;

let modalKey: string;
// console.log(components);
function SettingsModal(props: ModalProps) {
  return (
    <ModalRoot {...props}>
      <ModalHeader>
        <FormItem>
          <FormText.DEFAULT>Settings</FormText.DEFAULT>
        </FormItem>
      </ModalHeader>
      <ModalContent>
        <Settings />
      </ModalContent>
      <ModalFooter>
        <ModalCloseButton onClick={() => common.modal.closeModal(modalKey)}>Close</ModalCloseButton>
      </ModalFooter>
    </ModalRoot>
  );
}

export function openSettingsModal() {
  modalKey = common.modal.openModal((props) => <SettingsModal {...props} />);
}
