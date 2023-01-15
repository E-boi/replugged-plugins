import "./style.scss";
import { components } from "replugged";
import { openGithubModal } from "./Modal";
const { MenuItem, MenuGroup } = components.ContextMenu;

const ghRegex =
  /https?:\/\/(?:www.)?github.com\/([\w-]+\/[\w-]+)(?:\/((?:tree|blob)\/([\w-]+)\/([\w/.?]+)|((issues|pulls)(?:\/([0-9]+))?)))?/g;

export function stop(): void {
  // remove css from @primer/react
  document.querySelectorAll('[data-styled-version="5.3.6"]').forEach((e) => e.remove());
}

export function checkMessage(content: string, href?: string): JSX.Element | null {
  const match = [...(href?.matchAll(ghRegex) || content.matchAll(ghRegex))]?.[0];
  const tab = match?.[2] === "issues" ? "Issues" : match?.[2] === "pulls" ? "Pull Requests" : "";
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
