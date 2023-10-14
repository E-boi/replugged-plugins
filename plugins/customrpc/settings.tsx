import { useState } from "react";
import { components } from "replugged";
import { defaultRPC, pluginSettings, setRPC } from ".";
import { openRPCModal } from "./components/RPCSettings";
import SelectMenu from "./components/SelectMenu";
import UserActivities from "./components/UserActivities";
const { Button } = components;

export default () => {
  const [settings, setSettings] = useSettings();
  const [selected, setSelected] = useState(settings.selected);

  return (
    <div>
      <SelectMenu
        value={selected as unknown as string}
        options={settings.rpcs.map((rpc, i) => ({
          label: rpc.name,
          value: i as unknown as string,
        }))}
        onChange={(value) => setSelected(value as unknown as number)}>
        RPC'S
        <Button
          disabled={selected === -1 || settings.selected === selected}
          onClick={() => {
            setSettings("selected", selected);
            setRPC(settings.rpcs[selected]);
          }}>
          Set
        </Button>
        <Button
          onClick={() => {
            setSettings("rpcs", settings.rpcs.concat(defaultRPC));
            setSelected(settings.rpcs.length);
            openRPCModal(defaultRPC, (rpc) => {
              settings.rpcs[settings.rpcs.length] = rpc;
              setSettings("rpcs", settings.rpcs);
            });
          }}>
          Create
        </Button>
        <Button
          disabled={selected === -1}
          onClick={() =>
            openRPCModal(settings.rpcs[selected], (rpc) => {
              if (settings.selected === selected) setRPC(rpc);
              settings.rpcs[selected] = rpc;
              setSettings("rpcs", settings.rpcs);
            })
          }>
          Edit
        </Button>
        <Button
          color={Button.Colors.RED}
          disabled={selected === -1}
          onClick={() => {
            settings.rpcs.splice(selected, 1);
            setSettings("rpcs", settings.rpcs);
            setSelected(-1);
            if (settings.selected === selected) setSettings("selected", -1);
          }}>
          Delete
        </Button>
      </SelectMenu>
      <UserActivities />
    </div>
  );
};

function useSettings(): [
  ReturnType<(typeof pluginSettings)["all"]>,
  (typeof pluginSettings)["set"],
] {
  const [settings, setSettings] = useState(pluginSettings.all());

  const set = (
    k: Parameters<(typeof pluginSettings)["set"]>[0],
    value: Parameters<(typeof pluginSettings)["set"]>[1],
  ) => {
    pluginSettings.set(k, value);
    setSettings(pluginSettings.all());
    if (k === "selected") setRPC(value === -1 ? undefined : settings.rpcs[value as number]);
  };

  return [settings, set];
}
