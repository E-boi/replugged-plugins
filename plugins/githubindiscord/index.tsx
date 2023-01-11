import "./style.scss";
import { components } from "replugged";
import { openGithubModal } from "./Modal";
const { MenuItem, MenuGroup } = components.ContextMenu;

const ghRegex =
  /https?:\/\/(?:www.)?github.com\/([\w-]+\/[\w-]+)(?:\/((?:tree|blob)\/([\w-]+)\/([\w/.?]+)|(issues(\/([0-9]+))?)))?/g;

// declare global {
//   interface Window {
//     githubindiscord: {
//       checkMessage: (content: string, href: string) => JSX.Element | null;
//     };
//   }
// }

// export function start(): void {
//   window.githubindiscord = {
//     checkMessage,
//   };
// }

export function stop(): void {
  // remove css from @primer/react
  document.querySelectorAll('[data-styled-version="5.3.6"]').forEach((e, idx) => idx && e.remove());
}

export function checkMessage(content: string, href?: string): JSX.Element | null {
  const match = [...(href?.matchAll(ghRegex) || content.matchAll(ghRegex))]?.[0];
  const tab = match?.[2] === "issues" ? "Issues" : "";
  if (match?.[1])
    return (
      <MenuGroup>
        <MenuItem
          id="githubindiscord"
          label="Open Repository"
          action={() => openGithubModal(match[1], tab)}
        />
      </MenuGroup>
    );
  return null;
}
