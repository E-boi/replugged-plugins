import { settings } from "replugged";

export interface Setting {
  categories: Category[];
}

export interface Category {
  name: string;
  position: number;
  ids: string[];
  id: string;
  collapsed: boolean;
}

export default await settings.init<Setting>("dev.eboi.pindms", { categories: [] });
