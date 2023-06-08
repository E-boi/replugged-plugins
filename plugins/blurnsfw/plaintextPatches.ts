import type { PlaintextPatch } from "replugged/dist/types";

export default [
  {
    find: "renderAttachments=function",
    replacements: [
      {
        match: /renderMediaPostPreviewEmbeds\(\w+\)[\s\S]+?className:\w+.+container/g,
        replace: "$&,this?.props?.channel?.nsfw&&'rp-blurNsfw'",
      },
    ],
  },
] as PlaintextPatch[];
