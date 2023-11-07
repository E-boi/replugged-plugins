import "./style.css";
import { Box } from "@primer/react";
import { Injector, common, webpack } from "replugged";
import { MarkGithubIcon } from "@primer/styled-octicons";
import { Tooltip } from "replugged/components";
import { openGithubModal } from "./Modal";
import { Message } from "discord-types/general";
import ContextMenu from "./contextMenu";
import { ContextMenuTypes } from "replugged/types";
import { ContextMenu as c } from "replugged/components";

const { MenuItem, MenuGroup } = c;

export { default as Settings } from "./Settings";

const injector = new Injector();

const ghRegex =
  /https?:\/\/(?:www\.)?github.com\/(?<link>[\w-]+\/[\w.-]+)\/?((?<tree>tree|blob)\/(?<branch>[\w.-]+)\/?(?<path>[\w.\/]+)?|(?<issue>issues|pull)\/(?<issuenumber>\d+)|(?:commit\/(?<commit>\w+)))?/g;

export async function start() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const module = await webpack.waitForModule<any>(webpack.filters.byProps("EmbedVideo"));

  if (module) {
    injector.after(module.default?.prototype, "renderProvider", (_, res) => {
      if (!res) return res;
      const link = res._owner?.stateNode?.props?.embed?.url as string;
      if (!link) return res;
      const msg = checkMessage(link)?.[0];
      if (!msg) return res;

      // return res;
      return (
        <Box display="flex" className={res.props.className}>
          <span>{res.props.children.props.children}</span>
          <Tooltip style={{ marginLeft: "5px" }} text="Open Repository" position="top">
            <Box sx={{ cursor: "pointer" }} onClick={() => openGithubModal(msg)}>
              <MarkGithubIcon />
            </Box>
          </Tooltip>
        </Box>
      );
    });
  }

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
      <Tooltip
        style={{ cursor: "pointer", marginLeft: "5px" }}
        text="Open Repository"
        position="top">
        <span onClick={() => openGithubModal(msg)}>
          <MarkGithubIcon />
        </span>
      </Tooltip>,
    );
    return res;
  });

  injector.utils.addPopoverButton((msg: Message, _) => {
    const check = checkMessage(msg.content);
    if (!check.length) return null;

    return {
      label: "Open Repository",
      icon: () => <MarkGithubIcon />,
      onClick: () => openGithubModal(check[0]),
      onContextMenu: (e) => {
        common.contextMenu.open(e, () => <ContextMenu links={check} />);
      },
    };
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
            action={() => openGithubModal(msg[0])}
            icon={() => <MarkGithubIcon />}>
            {msg.length > 1 &&
              msg.map((m, i) => (
                <MenuItem
                  id={`githubindiscord-${i}`}
                  label={`Open ${m.url}`}
                  action={() => openGithubModal(m)}
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

enum Tabs {
  issue = "Issues",
  pull = "Pull Requests",
}

export interface GithubLink {
  url: string;
  tab?: Tabs;
  path?: string;
  branch?: string;
  issuenumber?: string;
  issue?: "pull" | "issue";
  commit?: string;
  tree?: string;
}

function checkMessage(content?: string): GithubLink[] {
  if (!content) return [];
  const match = [...content.matchAll(ghRegex)];

  return match.map((d) => ({
    url: d[1],
    tab: d.groups?.issue ? (d.groups!.issue === "issues" ? Tabs.issue : Tabs.pull) : undefined,
    branch: d.groups?.branch,
    path: d.groups?.path,
    tree: d.groups?.tree,
    commit: d.groups?.commit,
    issuenumber: d.groups?.issuenumber,
    issue: d.groups?.issue as GithubLink["issue"],
  }));
}
