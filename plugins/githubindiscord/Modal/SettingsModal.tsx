import { useEffect, useState } from "react";
import { common, components } from "replugged";
import { ModalProps } from "../Modals";
import { pluginSettings } from "../utils";
import { default as customTheme } from "../theme";
import { SelectMenu } from "../components";

const { ModalContent, ModalHeader, ModalRoot, ModalFooter, ModalCloseButton } = components.Modal;
const { FormItem, FormText, Input } = components;

let modalKey: string;

function SettingsModal(props: ModalProps) {
  const [key, setKey] = useState(pluginSettings.get("key", ""));
  const [darkTheme, setDarkTheme] = useState(pluginSettings.get("darkTheme", "dark_discord"));
  const [lightTheme, setLightTheme] = useState(pluginSettings.get("lightTheme", "light_discord"));

  useEffect(() => {
    pluginSettings.set("key", key);
    pluginSettings.set("darkTheme", darkTheme);
    pluginSettings.set("lightTheme", lightTheme);
  }, [key, darkTheme, lightTheme]);

  const darkThemes = Object.keys(customTheme.colorSchemes).filter((t) => t.includes("dark"));
  const lightThemes = Object.keys(customTheme.colorSchemes).filter((t) => t.includes("light"));
  console.log(lightThemes);
  return (
    <ModalRoot {...props}>
      <ModalHeader>
        <FormItem>
          <FormText.DEFAULT>Settings</FormText.DEFAULT>
        </FormItem>
      </ModalHeader>
      <ModalContent>
        <FormText.DESCRIPTION>
          Github Token (reload for the token to take effect)
        </FormText.DESCRIPTION>
        <Input value={key} onChange={setKey} />
        <FormText.DESCRIPTION>Dark Theme</FormText.DESCRIPTION>
        {SelectMenu && (
          <SelectMenu
            value={darkTheme}
            options={darkThemes.map((t) => ({ label: t, value: t }))}
            onChange={setDarkTheme}
          />
        )}
        <FormText.DESCRIPTION>Light Theme</FormText.DESCRIPTION>
        {SelectMenu && (
          <SelectMenu
            value={lightTheme}
            options={lightThemes.map((t) => ({ label: t, value: t }))}
            onChange={setLightTheme}
          />
        )}
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
