import type { PlaintextPatch } from "replugged/dist/types";

export default [
  {
    find: "resetThreadPopoutTimers=function",
    replacements: [
      {
        match: /!(.)..(.).renderEditButton\(\)/g,
        replace: "$&,!$1&&window.linkChannels?.linkButton?.({channel:$2?.props?.channel})",
      },
    ],
  },
] as PlaintextPatch[];
