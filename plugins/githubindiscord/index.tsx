import React from "react";
import { webpack } from "replugged";
import { buildGitModal } from "./Modal";
import { initModals } from "./Modals";
import "./style.css";

const ghRegex = /^https?:\/\/(www.)?github.com\/[\w-]+\/[\w-]+\/?/;

declare global {
  interface Window {
    githubindiscord: React.FC<{ link?: string }>;
  }
}

async function github() {
  const ContextMenu = await webpack.waitForModule<{ kS: React.FC<any>; sN: React.FC<any> }>(
    webpack.filters.bySource("♫ ⊂(｡◕‿‿◕｡⊂) ♪"),
  );

  return ({ link }: { link?: string }) => {
    if (!link || !link.match(ghRegex)) return null;
    const url = link.match(ghRegex)![0];
    return (
      <ContextMenu.kS>
        <ContextMenu.sN
          id="githubindiscord"
          label="Open Repo"
          action={() => buildGitModal(`${url.split("/")[3]}/${url.split("/")[4]}`)}
        />
      </ContextMenu.kS>
    );
  };
}

export async function start(): Promise<void> {
  await initModals();
  window.githubindiscord = await github();
}
