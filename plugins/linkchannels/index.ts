import { webpack } from "replugged";
import linkButton from "./LinkButton";

declare global {
  interface Window {
    linkChannels: {
      linkButton: React.FC<{ channel: { id: string } }>;
    };
    DiscordNative: {
      clipboard: {
        copy: (text: string) => void;
      };
    };
  }
}

export async function start(): Promise<void> {
  const tooltipMod = await webpack.waitForModule<Record<string, React.FC>>(
    webpack.filters.bySource(/shouldShowTooltip:!1/),
  );
  const Tooltip =
    tooltipMod && webpack.getFunctionBySource<React.FC>(/shouldShowTooltip:!1/, tooltipMod);
  if (!Tooltip) return;
  window.linkChannels = { linkButton: await linkButton(Tooltip) };
}

export function stop(): void {}
