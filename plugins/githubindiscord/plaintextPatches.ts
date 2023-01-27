import { PlaintextPatch } from "replugged/dist/types";

export default [
  {
    find: 'navId:"message"',
    replacements: [
      {
        match:
          /function \w+\((\w+)\){[\s\S]+MESSAGE_ACTIONS_MENU_LABEL,onSelect:\w+,children:(\[.+\])/g,
        replace:
          "$&.map(()=>null).concat(window.replugged.plugins.getExports('dev.eboi.githubindiscord')?.menu?.($1,$2)||$2)",
      },
    ],
  },
] as PlaintextPatch[];
