import { PlaintextPatch } from "replugged/dist/types";

export default [
  {
    find: 'navId:"message"',
    replacements: [
      {
        match:
          /(function \w+\((\w+)\){[\s]+var \w+=\w+.message[\s\S]+onSelect:\w+,children:)(\[.+\])}/g,
        replace: `$1(window.replugged.plugins.getExports('dev.eboi.githubindiscord')?.menu?.($2,$3)||$3)}`,
      },
    ],
  },
] as PlaintextPatch[];
