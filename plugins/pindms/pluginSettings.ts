import { settings } from "replugged";

export interface PluginSettings {
  categories: Category[];
  guildPins: GuildPin[];
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
});
