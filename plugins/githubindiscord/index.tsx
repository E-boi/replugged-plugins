import "./style.scss";
import { Injector, components, webpack } from "replugged";
import { openGithubModal } from "./Modal";
import { MarkGithubIcon } from "@primer/styled-octicons";
import { Box } from "@primer/react";
import { ModuleExports, ModuleExportsWithProps } from "replugged/dist/types";
const { MenuItem, MenuGroup } = components.ContextMenu;
const { Tooltip } = components;

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

export function start() {
  const e = webpack.getModule<{ ZP: Function }>((m) =>
    Boolean(getExportsForProto(m.exports, ["renderTitle"])),
  );
  if (!e) return;
  injector.after(e.ZP?.prototype, "renderProvider", (args, res) => {
    if (!res) return res;
    const link = res._owner?.stateNode?.props?.embed?.url;
    if (!link) return res;
    const msg = checkMessage(link);
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

function checkMessage(content: string) {
  const match = [...content.matchAll(ghRegex)]?.[0];
  if (!match) return null;
  const tab = match[2] === "issues" ? "Issues" : match[2] === "pulls" ? "Pull Requests" : "";
  return {
    url: match[1],
    tab,
  };
}

export function menu(content: string, href?: string) {
  const msg = checkMessage(href || content);
  if (!msg) return null;
  return (
    <MenuGroup>
      <MenuItem
        id="githubindiscord"
        label="Open Repository"
        action={() => openGithubModal(msg.url, msg.tab)}
      />
    </MenuGroup>
  );
}
