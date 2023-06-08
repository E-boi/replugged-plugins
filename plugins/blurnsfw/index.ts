import { settings } from "replugged";
import "./style.css";

export { default as Settings } from "./Settings";

export const pluginSettings = await settings.init<{ blurTiming: number; blurEffect?: number }>(
  "dev.eboi.blurnsfw",
  { blurEffect: 10, blurTiming: 1 },
);

export function updateVars() {
  const effect = pluginSettings.get("blurEffect");
  const time = pluginSettings.get("blurTiming");

  document.body.style.setProperty("--blur-effect", `blur(${effect}px)`);
  document.body.style.setProperty("--blur-timing", `${time}s`);
}

export function start() {
  updateVars();
}
