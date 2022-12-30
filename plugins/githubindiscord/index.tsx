import { buildGitModal } from "./Modal";
import "./style.css";
// @ts-ignore wait for rp to update package
import { components } from "replugged";
const { MenuItem, MenuGroup } = components.ContextMenu;

const ghRegex =
  /https?:\/\/(?:www.)?github.com\/([\w-]+\/[\w-]+)(?:\/(?:tree|blob)\/([\w-]+)\/)?([\w/.?]+)?/g;

declare global {
  interface Window {
    githubindiscord: {
      checkMessage: (content: string, href: string) => JSX.Element | null;
    };
  }
}

export function start(): void {
  window.githubindiscord = {
    checkMessage,
  };
}

function checkMessage(content: string, href?: string): JSX.Element | null {
  const match = [...(href?.matchAll(ghRegex) || content.matchAll(ghRegex))]?.[0];
  if (match?.[1])
    return (
      <MenuGroup>
        <MenuItem
          id="githubindiscord"
          label="Open Repository"
          action={() => buildGitModal(match[1])}
        />
      </MenuGroup>
    );
  return null;
}
