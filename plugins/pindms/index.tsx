import { ReactElement, useEffect, useState } from "react";
import { Injector, common, webpack } from "replugged";
import { PrivateChannelKey, RawPrivateChannel } from "./components";
import pluginSettings from "./pluginSettings";
import _ from "lodash";
import Pin from "./components/Pin";
import Categories from "./components/Categories";
import { CATEGORY_UPDATE } from "./constants";
import "./style.css";

export { default as Settings } from "./settings";

declare global {
  interface Window {
    _: typeof _;
  }
}

const Channels = webpack.getBySource("private-channels-", { raw: true });

const injector = new Injector();

export function start() {
  injector.after(Channels!.exports, "Z" as never, (_, res: ReactElement) => {
    const cates = pluginSettings.get("categories", []);
    const [__, forceUpdate] = useState({});

    useEffect(() => {
      const update = () => forceUpdate({});

      common.fluxDispatcher.subscribe(CATEGORY_UPDATE, update);
      return () => common.fluxDispatcher.unsubscribe(CATEGORY_UPDATE, update);
    });

    const ids = cates.map((c) => c.ids).flat();

    res.props.children.props.privateChannelIds = res.props.children.props.privateChannelIds.filter(
      (p: string) => !ids.includes(p),
    );

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
}

export function stop() {
  injector.uninjectAll();
}
