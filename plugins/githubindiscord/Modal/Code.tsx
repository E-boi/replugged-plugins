import { components } from "@octokit/openapi-types";
import { Avatar, Box, Breadcrumbs, Link, RelativeTime, Text, Truncate } from "@primer/react";
import { TreeView } from "@primer/react/drafts";
import { FileDirectoryFillIcon, FileIcon } from "@primer/styled-octicons";
import { useCallback, useContext, useEffect, useState } from "react";
import { common, webpack } from "replugged";
import { SelectMenu } from "../components";
import { Context } from "../context";
import { TreeWithContent, getCommits, getFile, pluginSettings } from "../utils";
import CommitsView from "./Commits/CommitView";

const { parser } = common;
const blober = webpack.getByProps("blob");

export default () => {
  return pluginSettings.get("view", "standard") === "treeview" ? <Tree /> : <StandardView />;
};

function StandardView() {
  const { data, switchBranch } = useContext(Context)!;
  const { tree, branches, currentBranch: branch, url } = data!;
  const [folder, setFolder] = useState<{
    current: { latestCommit?: components["schemas"]["commit"]; tree: TreeWithContent[] };
    prevs: Array<{ latestCommit?: components["schemas"]["commit"]; tree: TreeWithContent[] }>;
  }>({
    current: { tree, latestCommit: branch.commit },
    prevs: [],
  });
  const [file, setFile] = useState<TreeWithContent | null>(null);
  const [commit, setCommit] = useState<TreeWithContent["latestCommit"] | null>(null);

  useEffect(
    () =>
      setFolder({
        current: { tree, latestCommit: branch.commit },
        prevs: [],
      }),
    [tree],
  );

  const getBlob = useCallback(async (file: TreeWithContent) => {
    if (!file.content) file.content = (await getFile(url, file)).content;
    setFolder((prev) => ({
      current: prev.current,
      prevs: [...prev.prevs, prev.current],
    }));
    setFile(file);
  }, []);
  let path: string[] = (file?.path || folder.current.tree[0].path)!.split("/");
  let ending = path.pop();
  const latestCommit = file ? file.latestCommit : folder.current.latestCommit;

  if (commit) return <CommitsView commit={commit} onClose={() => setCommit(null)} />;
  return (
    <>
      <Box className="repository-options">
        {SelectMenu && (
          <SelectMenu
            className="Gbranches"
            value={branch.name}
            options={branches.map((branch) => ({ value: branch.name, label: branch.name }))}
            onChange={switchBranch}
          />
        )}
        {folder.prevs.length ? (
          <Breadcrumbs>
            <Breadcrumbs.Item
              onClick={() => {
                setFolder({ current: { tree, latestCommit: branch.commit }, prevs: [] });
                setFile(null);
              }}>
              {url.split("/")[1]}
            </Breadcrumbs.Item>
            {path.map((inPath, idx) => (
              <Breadcrumbs.Item
                selected={!file && idx === path.length - 1}
                onClick={() => {
                  const goIn = folder.prevs[idx + 1];
                  folder.prevs.splice(idx + 1, folder.prevs.length);
                  setFolder({ current: goIn, prevs: folder.prevs });
                  setFile(null);
                }}>
                {inPath}
              </Breadcrumbs.Item>
            ))}
            {file && <Breadcrumbs.Item selected>{ending}</Breadcrumbs.Item>}
          </Breadcrumbs>
        ) : null}
      </Box>
      <Box
        borderColor="border.default"
        borderStyle="solid"
        borderWidth={1}
        borderRadius={2}
        onMouseUp={(event) => {
          if (event.button !== 2 || event.detail !== 2 || !folder.prevs.length) return;
          setFolder((prev) => {
            const current = prev.prevs.pop();
            return {
              current: current ?? { tree, latestCommit: branch.commit },
              prevs: prev.prevs,
            };
          });
          setFile(null);
        }}>
        <Box
          p={3}
          bg="canvas.subtle"
          display="flex"
          alignItems="center"
          borderTopLeftRadius={6}
          borderTopRightRadius={6}>
          {latestCommit ? (
            <>
              <Avatar src={latestCommit.author!.avatar_url} />
              <Truncate
                maxWidth={"100%"}
                title={`${latestCommit.author!.login} ${latestCommit.commit.message}`}>
                <Text fontWeight="bold" sx={{ marginLeft: "5px" }}>
                  {latestCommit?.author?.login}
                  <Link muted onClick={() => setCommit(latestCommit)}>
                    <Text fontWeight="normal"> {latestCommit.commit.message.split("\n\n")[0]}</Text>
                  </Link>
                </Text>
              </Truncate>
              <RelativeTime
                sx={{ marginLeft: "auto" }}
                datetime={latestCommit.commit.author?.date}
                format="auto"
              />
            </>
          ) : (
            <Box
              className={blober?.blob as string}
              width={"100%"}
              height={20}
              bg="fg.default"
              opacity={0.03}
            />
          )}
        </Box>
        {folder.prevs.length > 0 && (
          <Box
            borderColor="border.muted"
            borderTopWidth={1}
            borderStyle="solid"
            px={3}
            py={2}
            sx={{ ":hover": { bg: "canvas.subtle", cursor: "pointer" } }}
            onClick={() => {
              setFolder((prev) => {
                const current = prev.prevs.pop();
                return {
                  current: current ?? { tree, latestCommit: branch.commit },
                  prevs: prev.prevs,
                };
              });
              setFile(null);
            }}>
            <Link sx={{ width: "100%" }}>..</Link>
          </Box>
        )}
        {file && (
          <Box
            borderColor="border.muted"
            borderTopWidth={1}
            borderStyle="solid"
            sx={{ userSelect: "text", code: { bg: "inherit" } }}>
            {parser.defaultRules.codeBlock.react(
              { content: window.atob(file.content!).trimEnd(), lang: file.fileType },
              // @ts-expect-error okay
              null,
              {},
            )}
          </Box>
        )}
        {!file &&
          folder.current.tree.map((c) => (
            <Box
              borderColor="border.muted"
              borderTopWidth={1}
              borderStyle="solid"
              display="flex"
              alignItems="center"
              sx={{ ":hover": { bg: "canvas.subtle" } }}
              px={3}
              py={2}>
              {c.type === "tree" ? (
                <FileDirectoryFillIcon color="marketingIcon.primary" size={16} mr={2} />
              ) : (
                <FileIcon color="fg.muted" size={16} mr={2} />
              )}
              <Link
                sx={{ color: "fg.default" }}
                onClick={() => {
                  if (c.type === "tree") {
                    setFolder((prev) => ({
                      current: c as typeof prev["current"],
                      prevs: [...prev.prevs, folder.current],
                    }));
                  } else void getBlob(c);

                  if (!c.latestCommit)
                    void getCommits(url, { path: c.path, sha: branch.name }).then((o) => {
                      if (o[0]) {
                        c.latestCommit = o[0];
                        if (c.type === "tree")
                          setFolder((prev) => ({
                            current: c as typeof prev["current"],
                            prevs: [...prev.prevs],
                          }));
                        else
                          setFile((prev) => {
                            if (prev) return { ...prev, latestCommit: c.latestCommit };
                            return null;
                          });
                      }
                    });
                }}>
                {c.filename}
              </Link>
            </Box>
          ))}
      </Box>
    </>
  );
}

function Tree() {
  const { data } = useContext(Context)!;
  const { tree } = data!;
  return (
    <TreeView aria-label="Files">
      {tree.map((tree) => (
        <TreeViewItem tree={tree} />
      ))}
    </TreeView>
  );
}

function TreeViewItem({ tree }: { tree: TreeWithContent }) {
  return (
    <TreeView.Item id={tree.path!}>
      <TreeView.LeadingVisual>
        {tree.type === "tree" ? <TreeView.DirectoryIcon /> : <FileIcon />}
      </TreeView.LeadingVisual>
      {tree.filename}
      {tree.type === "tree" && (
        <TreeView.SubTree>
          {tree.tree!.map((t) => (
            <TreeViewItem tree={t} />
          ))}
        </TreeView.SubTree>
      )}
    </TreeView.Item>
  );
}
