import { useMemo, useState } from "react";
import { common, components, webpack } from "replugged";
import { Channel, DPopout, SearchBar } from ".";
import pluginSettings, { Category } from "../pluginSettings";
import { CATEGORY_UPDATE } from "../constants";
import { getChannelIcon, getChannelName } from "../utils";

const ChannelStore = webpack.getByStoreName("ChannelStore");

const { auto } = webpack.getByProps<{ auto: string; none: string }>("auto", "none")!;

const ChannelItem = ({
  icon,
  name,
  checked,
  onClick,
}: {
  icon: string;
  name: string;
  checked: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="pindms-popout-channel" onClick={onClick}>
      <img
        src={icon}
        height={40}
        width={40}
        style={{ borderRadius: "9999px", marginRight: "8px" }}
      />
      <components.Text>{name}</components.Text>
      <input type="checkbox" checked={checked} style={{ marginLeft: "auto" }} />
    </div>
  );
};

const Popout = ({ category }: { category: Category }) => {
  if (!SearchBar) return null;

  const [query, setQuery] = useState("");

  const add = (id: string) => {
    const categories = pluginSettings.get("categories", []);
    const idx = categories.findIndex((c) => c.id == category.id);
    categories[idx].ids.push(id);
    pluginSettings.set("categories", categories);
    common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });
  };

  const remove = (id: string) => {
    const categories = pluginSettings.get("categories", []);
    const idx = categories.findIndex((c) => c.id == category.id);
    categories[idx].ids = categories[idx].ids.filter((i) => i !== id);
    pluginSettings.set("categories", categories);
    common.fluxDispatcher.dispatch({ type: CATEGORY_UPDATE });
  };

  const channels = useMemo(
    () =>
      Object.values((ChannelStore?.getMutablePrivateChannels as () => Channel[])())
        .filter((c) => getChannelName(c).includes(query))
        // @ts-expect-error boohoo
        .sort((a, b) => b.lastMessageId - a.lastMessageId)
        .sort((a, b) => (category.ids.includes(b.id) ? 1 : category.ids.includes(a.id) ? -1 : 0)),
    [query, JSON.stringify(category.ids)],
  );

  return (
    <div className={["pindms-popout", auto].join(" ")}>
      <SearchBar
        className="pindms-popout-search"
        query={query}
        onChange={(value: string) => setQuery(value)}
        onClear={() => setQuery("")}
      />
      {channels.map((c) => (
        <ChannelItem
          icon={getChannelIcon(c) ?? ""}
          checked={category.ids.includes(c.id)}
          name={getChannelName(c)}
          onClick={() => {
            if (category.ids.includes(c.id)) remove(c.id);
            else add(c.id);
          }}
        />
      ))}
    </div>
  );
};

export default ({ category }: { category: Category }) => {
  const [show, setShow] = useState(false);

  return (
    <DPopout
      shouldShow={show}
      onRequestClose={() => setShow(false)}
      renderPopout={() => <Popout category={category} />}>
      {() => (
        <svg
          viewBox="0 0 18 18"
          height={16}
          width={16}
          onClick={(e) => {
            e.stopPropagation();
            setShow(true);
          }}>
          <polygon
            fillRule="nonzero"
            fill="currentColor"
            points="15 10 10 10 10 15 8 15 8 10 3 10 3 8 8 8 8 3 10 3 10 8 15 8"
          />
        </svg>
      )}
    </DPopout>
  );
};
