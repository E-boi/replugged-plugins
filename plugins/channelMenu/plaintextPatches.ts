import type { PlaintextPatch } from "replugged/dist/types";

export default [
  {
    find: "renderAttachments=function",
    replacements: [
      {
        match: /className:o\(\).{15}er/g,
        replace: "$&,this?.props?.channel?.nsfw&&'rp-blurNsfw'",
      },
    ],
  },
] as PlaintextPatch[];
