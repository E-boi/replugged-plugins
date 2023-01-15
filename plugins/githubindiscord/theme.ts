import { theme } from "@primer/react";
import deepmerge from "deepmerge";

const baseTheme: typeof theme = deepmerge(theme, {
  colorSchemes: {
    dark_discord: {
      ...theme.colorSchemes.dark,
    },
    light_discord: {
      ...theme.colorSchemes.light,
    },
  },
});

export default deepmerge(baseTheme, {
  fonts: {
    normal: "inherit",
  },
  colorSchemes: {
    dark_discord: {
      colors: {
        border: {
          default: "var(--primary-dark-800)",
          muted: "var(--primary-dark-700)",
          subtle: "var(--primary-dark-700)",
        },
        fg: {
          default: "var(--text-normal)",
        },
        canvas: {
          subtle: "var(--background-modifier-hover)",
          default: "var(--modal-background)",
        },
        btn: {
          text: "var(--text-normal)",
          bg: "var(--button-secondary-background)",
          border: "transparent",
          hoverBg: "var(--button-secondary-background-hover)",
          hoverBorder: "transparent",
          // activeBg: "red",
          activeBorder: "transparent",
          // selectedBg: "red",
          // focusBg: "red",
          focusBorder: "transparent",
          counterBg: "rgba(27,31,36,0.08)",
          primary: {
            text: "var(--text-normal)",
            bg: "#2da44e",
            border: "transparent",
            hoverBg: "#2c974b",
            hoverBorder: "transparent",
            selectedBg: "hsla(137,55%,36%,1)",
            disabledText: "rgba(255,255,255,0.8)",
            disabledBg: "#94d3a2",
            disabledBorder: "transparent",
            focusBg: "#2da44e",
            focusBorder: "transparent",
            icon: "rgba(255,255,255,0.8)",
            counterBg: "rgba(255,255,255,0.2)",
          },
        },
      },
    },
  },
});
