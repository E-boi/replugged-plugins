import "./style.css";
import { common, settings } from "replugged";
import type _ from "lodash";
const { fluxDispatcher } = common;
export { default as Settings } from "./settings";

declare global {
  interface Window {
    _: typeof _;
  }
}

export interface RPC {
  clientId: string;
  name: string;
  showTime: boolean;
  buttons: Array<{ url: string; label: string }>;
  type: number;
  details?: string;
  state?: string;
  largeImage?: string;
  largeText?: string;
  smallImage?: string;
  smallText?: string;
  party: { members?: number; size?: number };
}

export interface DiscordRPC {
  application_id: string;
  name: string;
  type: number;
  details?: string;
  state?: string;
  timestamps?: {
    start?: number;
    end?: string;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  party?: {
    size: [number, number];
    id: string;
  };
  buttons?: string[];
  metadata?: {
    button_urls: string[];
  };
}

export const defaultRPC: Readonly<RPC> = {
  clientId: "787811010303885312",
  name: "Browsing Discord",
  details: "",
  state: "",
  showTime: true,
  type: 0,
  largeImage:
    "https://cdn.discordapp.com/attachments/770304534203334678/1068667265618292806/image.png",
  largeText: "",
  smallImage: "",
  smallText: "",
  party: {},
  buttons: [
    { url: "" as string, label: "" as string },
    { url: "" as string, label: "" as string },
  ],
};

export const pluginSettings = await settings.init<{
  selected: number;
  rpcs: RPC[];
}>("dev.eboi.customrpc");

export function start() {
  const connectionOpen = () => {
    if (!pluginSettings.has("selected")) {
      pluginSettings.set("selected", 0);
      pluginSettings.set("rpcs", [defaultRPC]);
    }
    const rpc = pluginSettings.get("rpcs")![pluginSettings.get("selected")!];
    setTimeout(() => rpc && setRPC(rpc), 1000);
    fluxDispatcher.unsubscribe("CONNECTION_OPEN", connectionOpen);
  };

  fluxDispatcher.subscribe("CONNECTION_OPEN", connectionOpen);
}

export function stop() {
  setRPC();
}

export function setRPC(rpc?: RPC) {
  fluxDispatcher.dispatch({
    type: "LOCAL_ACTIVITY_UPDATE",
    socketId: "replugged-epic-sex",
    pid: 69,
    activity: rpc && formatRPC(rpc),
  });
}

const regex = /https:\/\/(?:media|cdn)\.discordapp.(?:net|com)\/(.+)/g;

function extractUrl(url: string) {
  return url.split(regex)[1];
}

function formatRPC(rpc: RPC) {
  const discordrpc: DiscordRPC = {
    application_id: rpc.clientId,
    name: rpc.name,
    type: rpc.type,
    assets: {
      large_image: (rpc.largeImage && `mp:${extractUrl(rpc.largeImage)}`) || undefined,
      large_text: (rpc.largeText && rpc.largeText) || undefined,
      small_image: (rpc.smallImage && `mp:${extractUrl(rpc.smallImage)}`) || undefined,
      small_text: (rpc.smallText && rpc.smallText) || undefined,
    },
  };

  rpc.buttons.forEach((button) => {
    if (!discordrpc.buttons && button.label && button.url) {
      discordrpc.buttons = [];
      discordrpc.metadata = {
        button_urls: [],
      };
    }
    if (button.label && button.url) {
      discordrpc.buttons!.push(button.label);
      discordrpc.metadata!.button_urls.push(button.url);
    }
  });

  if (rpc.details) discordrpc.details = rpc.details;
  if (rpc.state) discordrpc.state = rpc.state;
  if (rpc.showTime)
    discordrpc.timestamps = {
      start: Date.now(),
    };
  if (rpc.party.members && rpc.party.size && rpc.state)
    discordrpc.party = {
      size: [rpc.party.members, rpc.party.size],
      id: "rplug",
    };

  return discordrpc;
}
