import { Avatar, Box, Breadcrumbs, Link, RelativeTime, Text, Truncate } from "@primer/react";
import { TreeView } from "@primer/react/drafts";
import { FileDirectoryFillIcon, FileIcon } from "@primer/styled-octicons";
import { useCallback, useContext, useState } from "react";
import { common, webpack } from "replugged";
import { SelectMenu } from "../components";
import { Context } from "../context";
import { TreeWithContent, getFile, getFolderInfo, pluginSettings } from "../utils";
import CommitsView from "./Commits/CommitView";
import Markdown from "./Markdown";

const { parser } = common;
const blober = webpack.getByProps("blob");

export default () => {
  return pluginSettings.get("view", "standard") === "treeview" ? <Tree /> : <StandardView />;
};

function StandardView() {
  const { data, switchBranch } = useContext(Context)!;
  const { tree, branches, currentBranch: branch, url, readme } = data!;
  const [folder, setFolder] = useState<{
    current: typeof tree;
    prevs: Array<typeof tree>;
  }>({
    current: tree,
    prevs: [],
  });
  const [file, setFile] = useState<TreeWithContent | null>(null);
  const [commit, setCommit] = useState<TreeWithContent["latestCommit"] | null>(null);

  const getBlob = useCallback(async (file: TreeWithContent) => {
    if (!file.content) file.content = (await getFile(url, file)).content;
    setFolder((prev) => ({
      current: prev.current,
      prevs: [...prev.prevs, prev.current],
    }));
    setFile(file);
  }, []);
  let path: string[] = (file?.path || folder.current.tree![0].path)!.split("/");
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
                setFolder({
                  current: tree,
                  prevs: [],
                });
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
              current: current ?? tree,
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
              <a className="relativeTime" href={latestCommit.html_url} target="_blank">
                <RelativeTime datetime={latestCommit.commit.author?.date} format="auto" />
              </a>
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
                  current: current ?? tree,
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
              null,
              {},
            )}
          </Box>
        )}
        {!file &&
          folder.current.tree!.map((c) => (
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
                      current: c,
                      prevs: [...prev.prevs, folder.current],
                    }));
                  } else void getBlob(c);

                  if (!c.latestCommit)
                    void getFolderInfo(url, { path: c.path, sha: branch.name, per_page: 1 }).then(
                      (o) => {
                        c.latestCommit = o.commits[0];
                        if (c.type === "tree")
                          setFolder((prev) => ({
                            current: c,
                            prevs: [...prev.prevs],
                          }));
                        else
                          setFile((prev) => {
                            if (prev) return { ...prev, latestCommit: c.latestCommit };
                            return null;
                          });

                        c.readme = o.readme as typeof readme;
                        c.hasReadme = Boolean(o.readme);
                      },
                    );
                }}>
                {c.filename}
              </Link>
            </Box>
          ))}
      </Box>
      {!file && folder.current.hasReadme && (
        <Markdown
          source={window.atob(folder.current.readme!.content)}
          sx={{
            p: 3,
            mt: 3,
            borderColor: "border.default",
            borderWidth: 1,
            borderStyle: "solid",
            borderRadius: 2,
          }}
        />
      )}
    </>
  );
}

function Tree() {
  const { data } = useContext(Context)!;
  const { tree } = data!;
  return (
    <TreeView aria-label="Files">
      {tree.tree!.map((tree) => (
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
