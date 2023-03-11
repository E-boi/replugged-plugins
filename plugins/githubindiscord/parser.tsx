import { useTheme } from "@primer/react";
import { ReactNode } from "react";
import { common, webpack } from "replugged";
import { Parser } from "replugged/dist/renderer/modules/common";
import { AnyFunction } from "replugged/dist/types";
import { textClasses } from "./components";

const defaultParser = webpack.getByProps(
  "sanitizeText",
  "markdownToReact",
  "defaultRules",
  "sanitizeUrl",
);
const defaultRules = defaultParser?.defaultRules as typeof common.parser.defaultRules;

const headings = {
  h1: textClasses?.["heading-xxl/bold"],
  h2: textClasses?.["heading-xl/bold"],
  h3: textClasses?.["heading-lg/bold"],
  h4: textClasses?.["heading-md/bold"],
  h5: textClasses?.["heading-sm/bold"],
  h6: textClasses?.["heading-sm/bold"],
};

const rules: Parser["defaultRules"] = {
  ...defaultRules,
  heading: {
    ...defaultRules.heading,
    match: (source) => /^ *(#{1,6})([^\n]+?)#* *(?:\n *)+/.exec(source),
    // @ts-expect-error okay
    react(props: { content: string; level: number }, t: AnyFunction, n: { key: string }) {
      const { theme } = useTheme();
      const Element = `h${props.level}` as keyof JSX.IntrinsicElements;
      return (
        <Element
          key={n.key}
          style={{ borderColor: theme!.colors.border.muted }}
          className={headings[Element as keyof typeof headings]}>
          {t(props.content, n) as ReactNode}
        </Element>
      );
    },
  },
  list: {
    ...defaultRules.list,
    match(source, state) {
      const prev = /(?:^|\n)( *)$/.exec(state.prevCapture ? state.prevCapture[0] : "");

      if (prev) {
        source = prev[1] + source;
        return /^( *)((?:[*+-]|\d+\.)) [\s\S]+?(?:\n{1,}(?! )(?!\1(?:[*+-]|\d+\.) )\n*|\s*\n*$)/.exec(
          source,
        );
      }
      return null;
    },
    // @ts-expect-error okay
    react(
      props: { ordered: boolean; start: string; items: string[] },
      t: AnyFunction,
      n: { key: string },
    ) {
      const Element = props.ordered ? "ol" : ("ul" as keyof JSX.IntrinsicElements);
      return (
        <Element key={n.key} style={{ listStyle: "disc", paddingLeft: "2em" }}>
          {props.items.map((l, i) => (
            <li key={i}>{t(l, n) as ReactNode}</li>
          ))}
        </Element>
      );
    },
  },
  blockQuote: {
    ...common.parser.defaultRules.blockQuote,
    // @ts-expect-error okay
    react(props: { content: string }, t: AnyFunction, n: { key: string }) {
      const { theme } = useTheme();
      return (
        <blockquote
          key={n.key}
          style={{
            color: theme?.colors.fg.default,
            padding: `0 1em`,
            borderColor: theme?.colors.border.default,
            borderStyle: "solid",
            borderLeftWidth: `0.25em`,
          }}>
          {t(props.content, n) as ReactNode}
        </blockquote>
      );
    },
  },
  codeBlock: common.parser.defaultRules.codeBlock,
  image: {
    ...defaultRules.image,
    match: (source) =>
      /^<img.+>|^!\[((?:\[[^\]]*\]|[^[\]]|\](?=[^[]*\]))*)\]\(\s*<?((?:\([^)]*\)|[^\s\\]|\\.)*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*\)/.exec(
        source,
      ),
    parse(match) {
      return {
        alt: /alt="(.*?)"/.exec(match[0])?.[1] || match[1],
        width: /width="(.*?)"/.exec(match[0])?.[1],
        height: /height="(.*?)"/.exec(match[0])?.[1],
        src: /src="(.*?)"/.exec(match[0])?.[1] || match[2],
        title: match[3],
      };
    },
    // @ts-expect-error okay
    react(
      props: { alt: string; width?: string; height?: string; src: string; title?: string },
      _t: AnyFunction,
      n: { key: string },
    ) {
      return (
        <img
          key={n.key}
          src={props.src}
          alt={props.alt}
          width={props.width}
          height={props.height}
          title={props.title}
        />
      );
    },
  },
  link: {
    ...defaultRules.link,
    // @ts-expect-error okay
    react(
      props: { content: unknown[]; target: string; title?: string },
      t: AnyFunction,
      n: { key: string },
    ) {
      return (
        <a
          key={n.key}
          href={(defaultParser?.sanitizeUrl as (url: string) => string)(props.target)}
          title={props.title ?? props.target}
          target="_blank">
          {t(props.content, n) as ReactNode}
        </a>
      );
    },
  },
  details: {
    order: 5,
    match: (source) => /^<details.+<summary>(.+)<\/summary>(.+)<\/details>/s.exec(source),
    // @ts-expect-error okay
    parse(match: string[], t: AnyFunction, n: { key: string }) {
      return {
        summary: match[1].trim(),
        content: t(match[2].trim(), n),
      };
    },
    // @ts-expect-error okay
    react(props: { content: unknown[]; summary: string }, t: AnyFunction, n: { key: string }) {
      return (
        <details key={n.key}>
          <summary style={{ cursor: "pointer" }}>{props.summary}</summary>
          {t(props.content, n) as ReactNode}
        </details>
      );
    },
  },
  italic: {
    order: defaultRules.em.order + 0.5,
    match: (source) => /^\*((?:\\[\s\S]|[^\\])+?)\*/.exec(source),
    // @ts-expect-error okay
    parse(match: RegExpExecArray, t: AnyFunction, n: { key: string }) {
      return {
        content: t(match[1], n),
      };
    },
    // @ts-expect-error okay
    react(props: { content: string[] }, t: AnyFunction, n: { key: string }) {
      return <i key={n.key}>{t(props.content, n) as ReactNode}</i>;
    },
  },
  paragraph: {
    ...defaultRules.paragraph,
    // @ts-expect-error okay
    react(props: { content: string[] }, t: AnyFunction, n: { key: string }) {
      return <p key={n.key}>{t(props.content, n) as ReactNode}</p>;
    },
  },
  inlineCode: {
    ...defaultRules.inlineCode,
    // @ts-expect-error okay
    react(props: { content: string }, _: unknown, n: { key: string }) {
      return (
        <code className="inlineCode" key={n.key}>
          {props.content}
        </code>
      );
    },
  },
};

const parse = (
  defaultParser?.parserFor as (
    rules: typeof defaultRules,
  ) => (source: string, stuff?: { inline: boolean }) => unknown
)(rules);
const reactOutput = (
  defaultParser?.outputFor as (rules: typeof defaultRules, outputFor: "react") => AnyFunction
)(rules, "react");
export function parseMarkdown(markdown: string): ReactNode {
  return reactOutput(parse(markdown, { inline: false })) as ReactNode;
}
