import { Box, Breadcrumbs, Link } from "@primer/react";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../context";
import { TreeWithContent, getFile, getFolderInfo } from "../../utils";
import { common, components } from "replugged";
import { FileDirectoryFillIcon } from "@primer/styled-octicons";
import Folder, { CommitHeader } from "./Folder";
import Markdown from "../Markdown";
import Spinner from "../Spinner";
import CommitsView from "../Commits/CommitView";

export default () => {
  const { data, getBranchCommit, updated, switchBranch } = useContext(Context)!;
  const [folder, setFolder] = useState<{
    current: TreeWithContent | undefined;
    prevs: TreeWithContent[];
  }>({
    current: undefined,
    prevs: [],
  });
  const [file, setFile] = useState<TreeWithContent | null>(null);
  const [commit, setCommit] = useState<TreeWithContent["commit"] | null>(null);

  useEffect(() => {
    if (data?.currentBranch.commitInfo) return;
    void getBranchCommit(data!.currentBranch.name);
  }, [data?.currentBranch.name]);

  useEffect(() => {
    if (folder.current?.commit || !folder.current) return;
    (async () => {
      const info = await getFolderInfo(data!.repo.full_name, {
        path: folder.current!.path,
        sha: data!.currentBranch.name,
        per_page: 1,
      });

      folder.current!.commit = info.commits[0];
      folder.current!.hasReadme = Boolean(info.readme);
      folder.current!.readme = info.readme;
      updated();
    })();
  }, [JSON.stringify(folder)]);

  useEffect(() => {
    if (file?.commit || !file) return;

    (async () => {
      const info = await getFolderInfo(data!.repo.full_name, {
        path: file.path,
        sha: data!.currentBranch.name,
        per_page: 1,
      });

      setFile((prev) => {
        if (!prev) return null;
        return { ...prev, commit: info.commits[0] };
      });
    })();
  }, [JSON.stringify(file)]);

  let path: string[] | undefined = (file?.path || folder.current?.path)?.split("/");
  let ending = path?.pop();

  if (commit) return <CommitsView commit={commit} onClose={() => setCommit(null)} />;

  return (
    <Box>
      <Box className="repository-options">
        <components.Select
          className="Gbranches"
          value={data!.currentBranch.name}
          options={data!.branches.map((branch) => ({ value: branch.name, label: branch.name }))}
          onSelect={switchBranch}
        />
      </Box>
      {path && (
        <Breadcrumbs sx={{ mb: 1 }}>
          <Breadcrumbs.Item
            onClick={() => {
              setFolder({
                current: undefined,
                prevs: [],
              });
              setFile(null);
            }}>
            {data?.repo.name}
          </Breadcrumbs.Item>
          {path.map((p, idx) => (
            <Breadcrumbs.Item
              onClick={() => {
                setFile(null);
                const goIn = folder.prevs[idx];
                if (!goIn) return;
                folder.prevs.splice(idx, folder.prevs.length);
                setFolder({ current: goIn, prevs: folder.prevs });
              }}>
              {p}
            </Breadcrumbs.Item>
          ))}
          <Breadcrumbs.Item selected>{ending}</Breadcrumbs.Item>
        </Breadcrumbs>
      )}
      {file ? (
        file.content ? (
          <>
            <CommitHeader
              commit={file.commit}
              onClick={() => {
                setCommit(file.commit);
              }}
            />
            <Box
              borderColor="border.default"
              borderWidth={1}
              mt={1}
              borderRadius={6}
              borderStyle="solid"
              sx={{ userSelect: "text", code: { bg: "inherit" } }}>
              <Box
                display="flex"
                alignItems="center"
                sx={{ ":hover": { bg: "canvas.subtle" } }}
                borderStyle="solid"
                borderColor="border.default"
                borderBottomWidth={1}
                px={3}
                py={2}
                onClick={() => setFile(null)}>
                <FileDirectoryFillIcon color="marketingIcon.primary" size={16} mr={2} />
                <Link sx={{ color: "fg.default" }}>..</Link>
              </Box>
              {common.parser.defaultRules.codeBlock.react(
                {
                  content: window.atob(file.content).trimEnd(),
                  lang: file.fileType,
                  type: "",
                },
                // @ts-expect-error uuhhh types
                null,
                {},
              )}
            </Box>
          </>
        ) : (
          <Spinner>Fetching File...</Spinner>
        )
      ) : (
        <Folder
          commit={folder.current ? folder.current.commit : data?.currentBranch.commitInfo}
          back={Boolean(path)}
          tree={folder.current?.tree ?? data!.tree}
          onBackClick={() => {
            setFolder((prev) => {
              const tree = prev.prevs.splice(-1, 1);
              return { current: tree[0], prevs: prev.prevs };
            });
          }}
          onCommitClick={(commit) => setCommit(commit)}
          onFileClick={(file) => {
            setFile(file);
            (async () => {
              const f = await getFile(data!.repo.full_name, file.sha!);
              setFile({ ...file, content: f.content });
            })();
          }}
          onFolderClick={(tree) => {
            setFolder((prev) => ({
              current: tree,
              prevs: prev.current ? [...prev.prevs, prev.current] : [],
            }));
          }}
        />
      )}
      {!file && (folder.current?.hasReadme || (!folder.current && data?.readme)) && (
        <Markdown
          source={atob(folder.current?.readme?.content ?? data!.readme!.content)}
          sx={{
            p: 3,
            mt: 3,
            borderColor: "border.default",
            borderWidth: 1,
            borderStyle: "solid",
            borderRadius: 6,
          }}
        />
      )}
    </Box>
  );
};
