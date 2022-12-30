import { ModalContent, ModalHeader, ModalProps, ModalRoot, openModal } from "../Modals";
import {
  Branch,
  Repo,
  abbreviateNumber,
  getBranches,
  getRepo,
} from "../utils";
import {
  GitBranchIcon,
  LockIcon,
  RepoForkedIcon,
  RepoIcon,
  StarIcon,
  TagIcon,
} from "@primer/styled-octicons";
import { AnchoredOverlay, Box, Button, Label, ThemeProvider } from "@primer/react";
import { SelectMenu, TabBar } from "../components";
import CommitsModal from "./CommitsModal";
import RepoModal from "./RepoModal";
// @ts-ignore wait for rp to update package
import { common,  webpack } from "replugged";
import { useEffect, useState } from "react";

const wumpus = {
  ...webpack.getByProps("emptyStateImage", "emptyStateSubtext"),
};

const textClasses = webpack.getByProps("heading-sm/bold");

const tabs = {
  repo: RepoModal,
  commits: CommitsModal,
};

export function GithubModal({ url, ...props }: ModalProps<{ url: string }>) {
  const [repoInfo, setInfo] = useState<Repo | null>(null);
  const [branches, setBranches] = useState<Branch[] | null>(null);
  const [selectedBranch, changeBranch] = useState<Branch | null>(null);
  const [tab, setTab] = useState<keyof typeof tabs>("repo");
  const [err, setError] = useState();
  useEffect(() => {
    (async () => {
      const repo = await getRepo(url).catch((e) => setError(e.message));
      if (!repo) return;
      const branches = await getBranches(url);
      setBranches(branches);
      changeBranch(branches.find((branch) => branch.name === repo.default_branch)!);
      setInfo(repo);
    })();
  }, []);

  const Tab = tabs[tab];

  return (
    <ModalRoot {...props} className={`githubModel`}>
      <ThemeProvider>
        <ModalHeader className="githeader">
          <div className="repo-path">
            <div className="repo-visibility-icon">
              {repoInfo?.visibility === "private" ? <LockIcon size={16} /> : <RepoIcon size={16} />}
            </div>
            <a
              className={[textClasses?.["heading-lg/normal"], "repository-owner"].join(" ")}
              href={repoInfo?.owner.html_url || `https://github.com/${repoInfo?.owner}`}
              target="_blank">
              {repoInfo?.owner.login}
            </a>
            <span className="separator">/</span>
            <a
              className={[textClasses?.["heading-lg/medium"], "repository-name"].join(" ")}
              href={repoInfo?.html_url || `https://github.com/${url}`}
              target="_blank">
              {repoInfo?.name || url}
            </a>
            <Label className="visibility">{repoInfo?.visibility}</Label>
          </div>
          <div className={[textClasses?.["heading-sm/medium"], "extlink-buttons"].join(" ")}>
            {repoInfo && (
              <a
                className="stargazers button"
                href={`${repoInfo.html_url}/stargazers`}
                target="_blank">
                <Button leadingIcon={StarIcon} verticalAlign={"middle"} sx={{ mr: 1 }}>
                  <span></span>
                  Stars
                  <Button.Counter>{abbreviateNumber(repoInfo?.stargazers_count)}</Button.Counter>
                </Button>
              </a>
            )}
            {repoInfo && (
              <a
                className="forks button"
                href={`${repoInfo?.html_url}/network/members`}
                target="_blank">
                <Button leadingIcon={RepoForkedIcon} verticalAlign={"middle"} sx={{ mr: 1 }}>
                  Fork
                  <Button.Counter>{abbreviateNumber(repoInfo.forks_count)}</Button.Counter>
                </Button>
              </a>
            )}
          </div>
        </ModalHeader>
        <ModalContent>
          <div className="repository-options">
            <div className="branches">
              {branches && SelectMenu && (
                <SelectMenu
                  className="Gbranches"
                  value={selectedBranch!.name}
                  options={branches.map((branch) => ({ value: branch.name, label: branch.name }))}
                  onChange={(value: string) => {
                    changeBranch(branches.find((branch) => branch.name === value)!);
                  }}
                />
              )}
              <div className="miscLinks">
                <a
                  href={`${repoInfo?.html_url}/branches`}
                  target="_blank"
                  className={[textClasses?.["heading-sm/normal"], "branchlink"].join(" ")}>
                  <GitBranchIcon size={16} mr={2} />
                  <span className={textClasses?.["heading-sm/normal"]}>Branches</span>
                </a>
                <a
                  href={`${repoInfo?.html_url}/tags`}
                  target="_blank"
                  className={[textClasses?.["heading-sm/normal"], "taglink"].join(" ")}>
                  <TagIcon size={16} mr={2} />
                  <span className={textClasses?.["heading-sm/normal"]}>Tags</span>
                </a>
              </div>
            </div>
            {TabBar && (
              <TabBar
                type={TabBar.Types.TOP_PILL}
                selectedItem={tab}
                onItemSelect={(tab) => {
                  setTab(tab as keyof typeof tabs);
                }}
                className="GTabs">
                <TabBar.Item itemType={TabBar.Types.TOP_PILL} id="repo" selectedItem="repo">
                  Repo
                </TabBar.Item>
                <TabBar.Item itemType={TabBar.Types.TOP_PILL} id="commits" selectedItem="commits">
                  Commits
                </TabBar.Item>
              </TabBar>
            )}
          </div>
          {err && (
            <div className="Gerror">
              <div className={wumpus.emptyStateImage as string} />
              <span className={`Gerror-text ${wumpus.emptyStateSubtext}`}>{err}</span>
            </div>
          )}
          {!err && <Tab {...{ repo: repoInfo, url, branch: selectedBranch }} />}
        </ModalContent>
      </ThemeProvider>
    </ModalRoot>
  );
}

export function buildGitModal(url: string) {
  // @ts-ignore
  common.modal.openModal((props) => <GithubModal {...props} url={url} />);
}
