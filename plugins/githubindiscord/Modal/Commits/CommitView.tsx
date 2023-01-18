import { operations } from "@octokit/openapi-types";
import { common } from "replugged";
import { Box, Link, Text } from "@primer/react";
import { SxProp } from "@primer/react/lib-esm/sx";
import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@primer/styled-octicons";
const { parser } = common;

export default ({
  commit,
  sx,
}: {
  commit: operations["pulls/list-files"]["responses"]["200"]["content"]["application/json"][0];
  sx?: SxProp["sx"];
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box
      borderStyle="solid"
      borderColor="border.default"
      borderWidth={1}
      borderRadius={2}
      {...(sx || {})}>
      <Box
        px={3}
        py={2}
        bg="canvas.subtle"
        borderTopLeftRadius={2}
        borderTopRightRadius={2}
        display="flex"
        alignItems="center">
        <Link muted sx={{ display: "flex" }} onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </Link>
        <Text ml={1}>{commit.filename}</Text>
      </Box>
      {expanded && (
        <Box
          borderColor="border.muted"
          borderTopWidth={1}
          borderStyle="solid"
          sx={{ userSelect: "text", code: { bg: "inherit" } }}>
          {parser.defaultRules.codeBlock.react(
            { content: commit.patch?.trimEnd(), lang: "patch" },
            // @ts-ignore
            null,
            {},
          )}
        </Box>
      )}
    </Box>
  );
};
