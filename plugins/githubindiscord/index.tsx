import "./style.scss";
import { Injector, components, webpack } from "replugged";
import { openGithubModal } from "./Modal";
import { MarkGithubIcon } from "@primer/styled-octicons";
import { Box } from "@primer/react";
import type { ModuleExports, ModuleExportsWithProps } from "replugged/dist/types";
const { MenuItem, MenuGroup } = components.ContextMenu;
const { Tooltip } = components;
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
  /https?:\/\/(?:www.)?github.com\/([\w-]+\/[\w-]+)(?:\/((?:tree|blob)\/([\w-]+)\/([\w/.?]+)|((issues|pulls)(?:\/([0-9]+))?)))?/g;

export async function start() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const module = await webpack.waitForModule<any>((m) =>
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
        <Tooltip style={{ position: "absolute", right: "10px" }} text="Open Repo" position="top">
          <Box sx={{ cursor: "pointer" }} onClick={() => openGithubModal(msg.url, msg.tab)}>
            <MarkGithubIcon />
          </Box>
        </Tooltip>
      </Box>
    );
  });
}

export function stop(): void {
  // remove css from @primer/react
  document.querySelectorAll('[data-styled-version="5.3.6"]').forEach((e, i) => i && e.remove());
  injector.uninjectAll();
}

const tabs = {
  issues: "Issues",
  pulls: "Pull Request",
};

function checkMessage(content: string) {
  const match = [...content.matchAll(ghRegex)];
  if (!match) return null;

  return match.map((d) => ({
    url: d[1],
    tab: d[2] && tabs[d[2] as keyof typeof tabs],
  }));
}

export function menu(content: string, href?: string) {
  const msg = checkMessage(href || content);
  if (!msg?.length) return null;

  return (
    <MenuGroup>
      <MenuItem
        id="githubindiscord"
        label="Open Repository"
        action={() => openGithubModal(msg[0].url, msg[0].tab)}>
        {msg.length &&
          msg.map((m, i) => (
            <MenuItem
              id={`githubindiscord-${i}`}
              label={`Open ${m.url}`}
              action={() => openGithubModal(m.url, m.tab)}
            />
          ))}
      </MenuItem>
    </MenuGroup>
  );
}
