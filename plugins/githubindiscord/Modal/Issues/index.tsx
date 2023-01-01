import { components } from "@octokit/openapi-types";
import { Box, Label, LabelGroup, RelativeTime, Spinner, Text } from "@primer/react";
import { IssueOpenedIcon } from "@primer/styled-octicons";
import { FC, memo, useEffect, useState } from "react";
import { getIssues } from "../../utils";
import IssueComp from "./Issue";

interface Props {
  url: string;
  repo: (components["schemas"]["repository"] & { commit: components["schemas"]["commit"] }) | null;
  // branch: Branch | null;
}

const Issues: FC<Props> = ({ url, repo }) => {
  const [issues, setIssues] = useState<components["schemas"]["issue"][] | null>();
  const [issue, setIssue] = useState<components["schemas"]["issue"] | null>();

  useEffect(() => {
    (async () => {
      if (!repo) return;
      const issues = await getIssues(url, { state: "open" });
      setIssues(issues);
    })();
  }, [repo]);

  if (!issues)
    return (
      <div>
        <p>Fetching Issues</p>
        <Spinner size="medium" />
      </div>
    );

  if (issue) return <IssueComp issue={issue} url={url} />;

  return (
    <Box borderColor="border.subtle" borderWidth={1} borderStyle="solid">
      {issues.map((issue) => (
        <Box
          borderColor="border.subtle"
          borderTopWidth={1}
          borderStyle="solid"
          px={3}
          py={2}
          sx={{ display: "flex" }}>
          <IssueOpenedIcon color="#3fb950" />
          <div style={{ display: "flex", flexDirection: "column", marginLeft: "10px" }}>
            <div>
              <Text as="a" onClick={() => setIssue(issue)}>
                {issue.title}
              </Text>
              <LabelGroup>
                {issue.labels.map((label) => (
                  <Label
                    sx={{
                      borderColor:
                        (typeof label !== "string" && label.color && `#${label.color}`) || null,
                      color:
                        (typeof label !== "string" && label.color && `#${label.color}`) || null,
                    }}>
                    {typeof label === "string" ? label : label.name}
                  </Label>
                ))}
              </LabelGroup>
            </div>
            <Text fontSize="small" sx={{ marginTop: "5px" }}>
              #{issue.number} opened <RelativeTime datetime={issue.created_at} /> by{" "}
              {issue.user?.login}
            </Text>
          </div>
        </Box>
      ))}
    </Box>
  );
};

export default memo(Issues);
