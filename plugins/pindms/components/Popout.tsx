import { useMemo, useState } from "react";
import { common, components, webpack } from "replugged";
import { Channel, DPopout, SearchBar, User } from ".";
import pluginSettings, { Category } from "../pluginSettings";
import { CATEGORY_UPDATE } from "../constants";

const ChannelStore = webpack.getByProps("getMutablePrivateChannels");

const { getUser } = webpack.getByProps("getUser", "findByTag")! as {
  getUser: (id: string) => User;
};

const { auto } = webpack.getByProps("auto", "none")!;

const { getChannelIconURL }: { getChannelIconURL: (channel: Channel) => string } =
  webpack.getByProps("getChannelIconURL")!;

function getName(channel: Channel) {
  return channel.type === 3
    ? channel.name || channel.rawRecipients?.map((e) => e.username).join(", ")
    : channel.rawRecipients[0].username;
}

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
        .filter((c) => getName(c).includes(query))
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
        onChange={(value) => setQuery(value)}
        onClear={() => setQuery("")}
      />
      {channels.map((c) => {
        if (c.type === 1) {
          const user = getUser(c.rawRecipients[0].id);
          if (!user) return null;
          // console.log(user);
          return (
            <ChannelItem
              icon={user.getAvatarURL()}
              checked={category.ids.includes(c.id)}
              name={user.username}
              onClick={() => {
                if (category.ids.includes(c.id)) remove(c.id);
                else add(c.id);
              }}
            />
          );
        }

        const icon = getChannelIconURL(c);
        return (
          <ChannelItem
            icon={icon}
            checked={category.ids.includes(c.id)}
            name={getName(c)}
            onClick={() => {
              if (category.ids.includes(c.id)) remove(c.id);
              else add(c.id);
            }}
          />
        );
      })}
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
