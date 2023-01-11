import { components } from "@octokit/openapi-types";
import { Avatar, Box, Breadcrumbs, Link, RelativeTime, Text, Truncate } from "@primer/react";
import { TreeView } from "@primer/react/drafts";
import { FileDirectoryFillIcon, FileIcon } from "@primer/styled-octicons";
import { useCallback, useEffect, useState } from "react";
import { webpack } from "replugged";
import { TabProps } from ".";
import { SelectMenu } from "../components";
import { TreeWithContent, getFile, pluginSettings } from "../utils";

const parser: any = webpack.getByProps("parse", "parseTopic");

export default (props: TabProps) => {
  return pluginSettings.get("view", "standard") === "treeview" ? (
    <Tree {...props} />
  ) : (
    <StandardView {...props} />
  );
};

function StandardView({ tree, branch, branches, url, switchBranches }: TabProps) {
  const [folder, setFolder] = useState<{
    current: { latestCommit: components["schemas"]["commit"]; tree: TreeWithContent[] };
    prevs: Array<{ latestCommit: components["schemas"]["commit"]; tree: TreeWithContent[] }>;
  }>({
    current: { tree, latestCommit: branch.commit },
    prevs: [],
  });
  const [file, setFile] = useState<
    (components["schemas"]["blob"] & { filename: string; type: string }) | null
  >(null);

  useEffect(
    () =>
      setFolder({
        current: { tree, latestCommit: branch.commit },
        prevs: [],
      }),
    [tree],
  );

  const getBlob = useCallback(async (file: TreeWithContent) => {
    const f = await getFile(url, file);
    setFile(f);
  }, []);
  let path: string[] = folder.current.tree[0].path!.split("/");
  path.pop();
  return (
    <>
      <Box className="repository-options">
        {SelectMenu && (
          <SelectMenu
            className="Gbranches"
            value={branch.name}
            options={branches.map((branch) => ({ value: branch.name, label: branch.name }))}
            onChange={(value: string) => {
              switchBranches(value);
              // changeBranch(branches.find((branch) => branch.name === value)!);
            }}
          />
        )}
        {folder.prevs.length ? (
          <Breadcrumbs>
            <Breadcrumbs.Item
              onClick={() =>
                setFolder({ current: { tree, latestCommit: branch.commit }, prevs: [] })
              }>
              {url.split("/")[1]}
            </Breadcrumbs.Item>
            {path.map((inPath, idx) => (
              <Breadcrumbs.Item
                selected={idx === path.length - 1}
                onClick={() => {
                  const goIn = folder.prevs[idx + 1];
                  folder.prevs.splice(idx + 1, folder.prevs.length);
                  console.log(folder.prevs);
                  setFolder({ current: goIn, prevs: folder.prevs });
                }}>
                {inPath}
              </Breadcrumbs.Item>
            ))}
          </Breadcrumbs>
        ) : null}
      </Box>
      <Box borderColor="border.default" borderStyle="solid" borderWidth={1} borderRadius={2}>
        <Box
          p={3}
          bg="canvas.subtle"
          display="flex"
          alignItems="center"
          borderTopLeftRadius={6}
          borderTopRightRadius={6}>
          <Avatar src={folder.current.latestCommit.author!.avatar_url} />
          <Truncate
            maxWidth={"100%"}
            title={`${folder.current.latestCommit.author?.login} ${folder.current.latestCommit.commit.message}`}>
            <Text fontWeight="bold" sx={{ marginLeft: "5px" }}>
              {folder.current.latestCommit.author?.login}
              <Text fontWeight="normal">
                {" "}
                {folder.current.latestCommit.commit.message.split("\n\n")[0]}
              </Text>
            </Text>
          </Truncate>
          <RelativeTime
            sx={{ marginLeft: "auto" }}
            datetime={folder.current.latestCommit.commit.author?.date}
            format="auto"
          />
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
              { content: window.atob(file.content), lang: file.type },
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
                  if (c.type === "tree")
                    setFolder((prev) => ({
                      current: c as any,
                      prevs: [...prev.prevs, folder.current],
                    }));
                  else {
                    getBlob(c);
                    setFolder((prev) => ({
                      current: prev.current,
                      prevs: [...prev.prevs, prev.current],
                    }));
                  }
                }}>
                {c.filename}
              </Link>
            </Box>
          ))}
      </Box>
    </>
  );
}

function Tree({ tree }: TabProps) {
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
