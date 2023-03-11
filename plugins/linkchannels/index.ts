export { default as linkButton } from "./LinkButton";
declare global {
  interface Window {
    DiscordNative: {
      clipboard: {
        copy: (text: string) => void;
      };
    };
  }
}
