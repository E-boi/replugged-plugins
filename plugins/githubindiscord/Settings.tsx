import { useEffect, useState } from "react";
import { components } from "replugged";
import { pluginSettings } from "./utils";
import { default as customTheme } from "./theme";
import { SelectItem, FormText, TextInput } from "replugged/components";

export default () => {
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

  return (
    <div>
      <FormText.DESCRIPTION>
        Github Token (reload for the token to take effect)
      </FormText.DESCRIPTION>
      <TextInput value={key} onChange={setKey} />
      <FormText.DESCRIPTION>Dark Theme</FormText.DESCRIPTION>
      <SelectItem
        value={darkTheme}
        options={darkThemes.map((t) => ({ label: t, value: t }))}
        onChange={setDarkTheme}
      />
      <FormText.DESCRIPTION>Light Theme</FormText.DESCRIPTION>
      <SelectItem
        value={lightTheme}
        options={lightThemes.map((t) => ({ label: t, value: t }))}
        onChange={setLightTheme}
      />
    </div>
  );
};
