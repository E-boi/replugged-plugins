import type { PlaintextPatch } from "replugged/dist/types";

export default [
  {
    find: "renderAttachments=function",
    replacements: [
      {
        match: /(renderMediaPostEmbeds\([\w]+\)[\s\S]+?className:)(.*?\)),/gm,
        replace: (e, match, className) => {
          console.log(e);
          console.log(
            `${match}[${className},this?.props?.channel?.nsfw&&'rp-blurNsfw'].join(' '),`,
          );
          return `${match}[${className},this?.props?.channel?.nsfw&&'rp-blurNsfw'].join(' '),`;
        },
      },
    ],
  },
] as PlaintextPatch[];
