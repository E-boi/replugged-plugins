import "./style.scss";
import { Injector, common, components, types, webpack } from "replugged";
import { openGithubModal } from "./Modal";
import { MarkGithubIcon } from "@primer/styled-octicons";
import { Box } from "@primer/react";
import type {
  AnyFunction,
  ModuleExports,
  ModuleExportsWithProps,
  RawModule,
} from "replugged/dist/types";
// import { ReactNode } from "react";
const { MenuItem, MenuGroup } = components.ContextMenu;
const { Tooltip } = components;
const { ContextMenuTypes } = types;

export { default as Settings } from "./Settings";

const injector = new Injector();

export function getExportsForProto<
  P extends string = string,
  T extends ModuleExportsWithProps<P> = ModuleExportsWithProps<P>,
>(m: ModuleExports, props: P[]): T | undefined {
  if (typeof m !== "object") return undefined;
  return Object.values(m).find((o) => {
    return (
      typeof o === "function" && o != null && o.prototype && props.every((p) => p in o.prototype)
    );
  }) as T | undefined;
}

const ghRegex =
  /https?:\/\/(?:www.)?github.com\/([\w-]+\/[\w.-]+)(?:\/((?:tree|blob)\/([\w-]+)\/([\w/.?]+)|((issues|pulls)(?:\/([0-9]+))?)))?/g;

export async function start() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const module = await webpack.waitForModule<any>((m: RawModule<{ renderTitle: AnyFunction }>) =>
    Boolean(getExportsForProto(m.exports, ["renderTitle"])),
  );

  if (!module) return;

  injector.after(module.ZP?.prototype, "renderProvider", (_, res) => {
    if (!res) return res;
    const link = res._owner?.stateNode?.props?.embed?.url as string;
    if (!link) return res;
    const msg = checkMessage(link)?.[0];
    if (!msg) return res;
    return (
      <Box display="flex" className={res.props.className}>
        <span>{res.props.children.props.children}</span>
        <Tooltip
          style={{ position: "absolute", right: "10px" }}
          text="Open Repository"
          position="top">
          <Box sx={{ cursor: "pointer" }} onClick={() => openGithubModal(msg.url, msg.tab)}>
            <MarkGithubIcon />
          </Box>
        </Tooltip>
      </Box>
    );
  });

  injector.after(common.parser.defaultRules.link, "react", (args, res) => {
    // @ts-expect-error yes it is
    if (!Array.isArray(res)) res = [res];
    const link = args[0]?.target;
    // console.log(link);
    if (!link) return res;
    const msg = checkMessage(link)?.[0];
    if (!msg) return res;
    // @ts-expect-error yes it is
    res.push(
      <Tooltip style={{ cursor: "pointer", marginLeft: "5px" }} text="Open Repo" position="top">
        <span onClick={() => openGithubModal(msg.url, msg.tab)}>
          <MarkGithubIcon />
        </span>
      </Tooltip>,
    );
    return res;
  });

  injector.utils.addMenuItem(
    ContextMenuTypes.Message,
    (data: { message?: { content: string }; itemHref?: string }) => {
      const msg = checkMessage(data.message?.content ?? data.itemHref);
      if (!msg.length) return;

      return (
        <MenuGroup>
          <MenuItem
            id="githubindiscord"
            label="Open Repository"
            action={() => openGithubModal(msg[0].url, msg[0].tab)}
            icon={() => <MarkGithubIcon />}>
            {msg.length > 1 &&
              msg.map((m, i) => (
                <MenuItem
                  id={`githubindiscord-${i}`}
                  label={`Open ${m.url}`}
                  action={() => openGithubModal(m.url, m.tab)}
                  icon={() => <MarkGithubIcon size={12} />}
                />
              ))}
          </MenuItem>
        </MenuGroup>
      );
    },
  );
}

export function stop(): void {
  // remove css from @primer/react
  document.querySelectorAll('[data-styled-version="5.3.11"]').forEach((e, i) => i && e.remove());
  injector.uninjectAll();
}

const tabs = {
  issues: "Issues",
  pulls: "Pull Request",
};

function checkMessage(content?: string) {
  if (!content) return [];
  const match = [...content.matchAll(ghRegex)];

  return match.map((d) => ({
    url: d[1],
    tab: d[2] && tabs[d[2] as keyof typeof tabs],
  }));
}
