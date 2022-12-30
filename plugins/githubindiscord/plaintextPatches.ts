import { PlaintextPatch } from "replugged/dist/types";

export default [
  {
    find: 'navId:"message"',
    replacements: [
      {
        match: /function ..\((.)\){var.+channel[\s\S]+onSelect:.,children:\[.+\w}\)/g,
        replace:
          "$&,(()=>window.githubindiscord?.checkMessage?.($1?.message?.content,$1?.target?.href)||null)()",
      },
    ],
  },
] as PlaintextPatch[];
