import type { PlaintextPatch } from "replugged/dist/types";

export default [
  {
    find: "ChannelTextAreaForm > Popout > renderPopout: contentWarningProps cannot be null",
    replacements: [
      {
        match:
          /(textValue:this\.state\.textValue,richValue:this\.state\.richValue,focused:\w+,className:)(\w+\.channelTextArea),channel:(\w+)/gm,
        replace: (e, match, className, channel) => {
          return `${match}[${className},${channel}?.nsfw&&"rp-blurNsfw"].join(" "),channel:${channel}`;
        },
      },
    ],
  },
] as PlaintextPatch[];
