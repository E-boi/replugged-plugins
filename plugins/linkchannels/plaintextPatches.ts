import type { PlaintextPatch } from "replugged/dist/types";

export default [
  {
    find: "resetThreadPopoutTimers(){",
    replacements: [
      {
        match: /!(\w+)..(\w+).renderEditButton\(\)/g,
        replace:
          "$&,!$1&&window.replugged.plugins.getExports('dev.eboi.linkchannels')?.linkButton?.({channel:$2?.props?.channel})",
      },
    ],
  },
] as PlaintextPatch[];
