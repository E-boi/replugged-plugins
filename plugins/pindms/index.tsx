import { ReactElement, useEffect, useState } from "react";
import { Injector, common, util, webpack } from "replugged";
import { PrivateChannelKey, RawPrivateChannel } from "./components";
import pluginSettings from "./pluginSettings";
import _ from "lodash";
import Pin from "./components/Pin";
import Categories from "./components/Categories";
import { CATEGORY_UPDATE, GUILDLIST_UPDATE } from "./constants";
import "./style.css";
import { AnyFunction, ObjectExports } from "replugged/dist/types";
import { findInReactTree, forceUpdate } from "./utils";
import GuildPins from "./components/GuildPins";

export { default as Settings } from "./settings";

declare global {
  interface Window {
    _: typeof _;
  }
}

const Channels = webpack.getBySource("private-channels-", { raw: true });
const ChannelsKey =
  Channels &&
  webpack.getFunctionKeyBySource(Channels.exports as ObjectExports, "private-channels-");

const guildClasses = await webpack.waitForProps<{ guilds: string; sidebar: string }>(
  "guilds",
  "sidebar",
);

export const injector = new Injector();

export function start() {
  if (Channels && ChannelsKey)
    injector.after(Channels.exports, ChannelsKey as never, (_, res: ReactElement) => {
      const [__, forceUpdate] = useState({});
      const cates = pluginSettings.get("categories", []);

      useEffect(() => {
        const update = () => forceUpdate({});

        common.fluxDispatcher.subscribe(CATEGORY_UPDATE, update);
        return () => common.fluxDispatcher.unsubscribe(CATEGORY_UPDATE, update);
      }, []);

      const ids = cates.map((c) => c.ids).flat();

      res.props.children.props.privateChannelIds =
        res.props.children.props.privateChannelIds.filter((p: string) => !ids.includes(p));

      if (
        !res.props?.children?.props?.children?.some(
          (c: ReactElement) => c?.key === "pindms-categories",
        )
      )
        res.props.children.props.children.push(
          <Categories
            key="pindms-categories"
            selectedChannelId={res.props.children.props.selectedChannelId}
          />,
        );

      return res;
    });

  // @ts-expect-error yes
  injector.after(RawPrivateChannel, PrivateChannelKey, (args, res: ReactElement) => {
    res.props?.children?.props?.children?.push?.(<Pin selectedId={args[0].id} />);
    return res;
  });

  void patchGuildNav();
}

export function stop() {
  injector.uninjectAll();

  util
    .waitFor(`.${guildClasses.guilds}`)
    .then(forceUpdate)
    .catch(() => {});
}

async function patchGuildNav() {
  const GuildsNav = await webpack.waitForModule<Record<"type", AnyFunction>>(
    webpack.filters.bySource("guildsnav"),
  );

  if (!GuildsNav) return;

  injector.after(GuildsNav, "type", ([props]: [{ className: string }], res: ReactElement) => {
    const GuildsNavBar = findInReactTree(res, (node) =>
      node?.props?.className?.includes(props.className),
    );
    if (!GuildsNavBar) return res;

    patchGuildsNavBar(GuildsNavBar);
    return res;
  });

  util
    .waitFor(`.${guildClasses.guilds}`)
    .then(forceUpdate)
    .catch(() => {});
}

function patchGuildsNavBar(component: JSX.Element): void {
  injector.after(component, "type", (_, res) => {
    const NavScroll = findInReactTree(res, (node) => node?.props?.onScroll);
    if (!NavScroll?.props?.children) return res;

    // console.log(NavScroll);
    let PinIndex = 3;

    const getIndexByKeyword = (keyword: string): number =>
      NavScroll.props.children.findIndex((child: ReactElement) =>
        child?.type?.toString()?.includes(keyword),
      );

    const FavouritesIndex = getIndexByKeyword("favorites");
    if (FavouritesIndex !== -1) {
      PinIndex = FavouritesIndex + 1;
    } else {
      const HomeButtonIndex = getIndexByKeyword("getHomeLink");
      if (HomeButtonIndex !== -1) {
        PinIndex = HomeButtonIndex + 1;
      }
    }

    // console.log(PinIndex);

    const UnreadDMsIndex = getIndexByKeyword("getUnreadPrivateChannelIds");
    if (UnreadDMsIndex != -1) {
      patchUnreadDMs(NavScroll.props.children[UnreadDMsIndex]);
    }

    NavScroll.props.children.splice(PinIndex, 0, <GuildPins />);

    return res;
  });
}

function patchUnreadDMs(component: JSX.Element) {
  injector.after(component, "type", (_, res) => {
    const [__, forceUpdate] = useState({});
    const pins: string[] = pluginSettings.get("guildPins", []);

    useEffect(() => {
      const update = () => forceUpdate({});

      common.fluxDispatcher.subscribe(GUILDLIST_UPDATE, update);
      return () => common.fluxDispatcher.unsubscribe(GUILDLIST_UPDATE, update);
    }, []);

    res.props.children = res.props.children.filter(
      (c: ReactElement) => !pins.includes(c.key as string),
    );

    return res;
  });
}
