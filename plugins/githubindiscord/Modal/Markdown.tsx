import { Box } from "@primer/react";
import { BetterSystemStyleObject } from "@primer/react/lib/sx";
import { useMemo } from "react";
import { parseMarkdown } from "../parser";

export default ({ source, sx }: { source: string; sx?: BetterSystemStyleObject }) => {
  const markdown = useMemo(() => parseMarkdown(source), [source]);

  return (
    <Box
      className="gid-markdown"
      sx={{
        ...sx,
        userSelect: "text",
        code: { bg: "canvas.subtle" },
        lineHeight: "2rem",
        img: {
          maxWidth: "100%",
        },
      }}>
      {markdown}
    </Box>
  );
};
