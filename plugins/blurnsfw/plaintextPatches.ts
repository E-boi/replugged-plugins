import type { PlaintextPatch } from "replugged/dist/types";

export default [
  {
    find: "ChannelTextAreaForm > Popout > renderPopout: contentWarningProps cannot be null",
    replacements: [
      {
        match:
          /(getInitialValuesFromInteractionOptions[^]*?channel:(\w+)[^]*?richValue:this\.state.richValue,[^]*?className:)([^]*?),/gm,
        replace: (e, match, channel, className) => {
          return `${match}[${className},${channel}?.nsfw&&"rp-blurNsfw"].join(" "),`;
        },
      },
    ],
  },
] as PlaintextPatch[];
