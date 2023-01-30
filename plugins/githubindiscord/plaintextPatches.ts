import { PlaintextPatch } from "replugged/dist/types";

export default [
  {
    find: 'navId:"message"',
    replacements: [
      {
        match:
          /(function \w+\((\w+)\){[\s\S]+MESSAGE_ACTIONS_MENU_LABEL,onSelect:\w+,children:)(\[.+\])/g,
        replace: `$1(window.replugged.plugins.getExports('dev.eboi.githubindiscord')?.menu?.($2,$3)||$3)`,
      },
    ],
  },
] as PlaintextPatch[];
