import {
  Avatar,
  Box,
  Link,
  Pagination,
  RelativeTime,
  Text,
  Timeline,
  Truncate,
} from "@primer/react";
import { CommitIcon } from "@primer/styled-octicons";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../context";
import { useCommits } from "../../paginate";
import { Issue, TreeWithContent } from "../../utils";
import Spinner from "../Spinner";
import CommitsView from "./CommitView";

export default ({ pr }: { pr?: NonNullable<Issue["pull"]> }) => {
  const { commits: repoCommits, data } = useContext(Context)!;
  const commits = pr ? useCommits(data!.repo.full_name, { pr: pr.number }) : repoCommits;
  const [commit, setCommit] = useState<NonNullable<TreeWithContent["commit"]> | null>(null);

  useEffect(() => {
    void commits?.fetch();
  }, []);

  if (!commits?.data?.page || !commits?.data?.info) return <Spinner>Fetching commits...</Spinner>;

  if (commit) return <CommitsView commit={commit} onClose={() => setCommit(null)} />;

  const page = commits.data.page[commits.data.info.currentPage - 1];

  return (
    <Timeline clipSidebar>
      {page.map((p) => (
        <Timeline.Item condensed>
          <Timeline.Badge>
            <CommitIcon />
          </Timeline.Badge>
          <Timeline.Body>
            <Text>
              Commits <RelativeTime datetime={p[0].commit.author?.date} format="datetime" />
            </Text>
            <Box
              borderStyle="solid"
              borderWidth={1}
              borderColor="border.default"
              borderRadius={2}
              mt={3}>
              {p.map((c, i) => (
                <Box
                  borderStyle="solid"
                  borderTopWidth={i ? 1 : 0}
                  borderColor="border.muted"
                  px={3}
                  py={2}>
                  <Truncate maxWidth={"100%"} title={`${c.commit.message}`}>
                    <Text as="p" m={0} mb={1}>
                      <Link
                        muted
                        sx={{ fontWeight: "bold", color: "fg.default" }}
                        onClick={() => setCommit(c)}>
                        {c.commit.message.split("\n\n")[0]}
                      </Link>
                    </Text>
                  </Truncate>
                  <Box>
                    <Avatar src={c.author?.avatar_url || ""} alt={`${c.author?.login}'s profile`} />
                    <Text>
                      <Text fontWeight="bold" ml={1} color="fg.default">
                        {c.author?.login}
                      </Text>{" "}
                      committed <RelativeTime datetime={c.commit.author?.date} />
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Timeline.Body>
        </Timeline.Item>
      ))}
      {commits.data.info.lastPage && (
        <Pagination
          currentPage={commits.data.info.currentPage}
          pageCount={commits.data.info.lastPage}
          showPages={false}
          onPageChange={(_, page) => {
            if (page > commits.data.info!.currentPage) void commits.nextPage();
            else void commits.previousPage();
          }}
        />
      )}
    </Timeline>
  );
};
