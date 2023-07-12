import { settings } from "replugged";

export interface PluginSettings {
  categories: Category[];
  guildPins: GuildPin[];
  showStatus: boolean;
}

export type GuildPin = string;

export interface Category {
  name: string;
  ids: string[];
  id: string;
  collapsed: boolean;
}

export default await settings.init<PluginSettings>("dev.eboi.pindms", {
  categories: [],
  guildPins: [],
  showStatus: true,
});
