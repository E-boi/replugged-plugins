import { memo, useCallback, useEffect, useState } from "react";
import { webpack } from "replugged";
import { getCommit } from "../../utils";
import { Spinner } from "@primer/react";
import { components } from "@octokit/openapi-types";

const classes = {
  markup: webpack.getByProps("markup")?.markup,
  scrollbarGhostHairline: webpack.getByProps("scrollbarGhostHairline")?.scrollbarGhostHairline,
};
const parser: any = webpack.getByProps("parse", "parseTopic");

export default memo(
  ({ url, committ }: { url: string; committ: components["schemas"]["commit"] }): any => {
    const [commit, setCommit] = useState<components["schemas"]["commit"] | null>(null);

    useEffect(() => {
      (async () => {
        setCommit(await getCommit(url, committ.sha));
      })();
    }, []);

    const parseCommit = useCallback((patch: string) => {
      const matches = patch.match(/@@.+/g);
      const splits = patch.split(/@@.+/g).filter((e) => e);
      const arr: string[] = [];

      matches?.forEach((match, idx) => {
        arr.push(match, splits[idx]);
      });
      return arr;
    }, []);

    if (!commit && Spinner)
      return (
        <p className="Gfetching">
          Fetching commit
          <Spinner size="medium" />
        </p>
      );
    else if (commit)
      return commit.files!.map((file) => (
        <div className={`${classes.markup} infile`}>
          {parseCommit(file.patch!).map((patch, idx) => {
            if (idx % 2)
              return parser.defaultRules.codeBlock.react(
                { content: patch.trimStart(), lang: "diff" },
                null,
                {},
              );
            else return <p className="commit">{patch}</p>;
          })}
        </div>
      ));
    return null;
  },
);
