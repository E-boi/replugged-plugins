import { PlaintextPatch } from "replugged/dist/types";

export default [
  {
    find: 'navId:"message"',
    replacements: [
      {
        match: /function ..\((.)\){var.+channel[\s\S]+onSelect:.,children:\[.+\w}\)/g,
        replace(substring, ...args) {
          console.log(substring, args);
          // console.log(substring.replace("})]", "}),(()=>{console.log(this);return null;})()]"));
          return `${substring},(()=>window.githubindiscord?.({link:${args[0]}?.target?.href})||null)()`;
        },
        // replace: "$&,(()=>{console.log(this);return null;})()",
      },
    ],
  },
] as PlaintextPatch[];
