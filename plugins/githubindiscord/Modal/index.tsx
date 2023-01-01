import { ModalProps } from "../Modals";
import { abbreviateNumber, getBranches, getRepo } from "../utils";
import {
  CodeIcon,
  CommitIcon,
  GitBranchIcon,
  IssueOpenedIcon,
  LockIcon,
  RepoForkedIcon,
  RepoIcon,
  StarIcon,
  TagIcon,
} from "@primer/styled-octicons";
import { Breadcrumbs, Button, Label, ThemeProvider, theme } from "@primer/react";
import { UnderlineNav } from "@primer/react/drafts";
import { SelectMenu } from "../components";
import CommitsModal from "./CommitsModal";
import RepoModal from "./RepoModal";
// @ts-ignore wait for rp to update package
import { common, components as rpC, webpack } from "replugged";
import { useEffect, useState } from "react";
import Issues from "./Issues";
import { components } from "@octokit/openapi-types";

const { ModalContent, ModalHeader, ModalRoot } = rpC.Modal;
const wumpus = {
  ...webpack.getByProps("emptyStateImage", "emptyStateSubtext"),
};

const textClasses = webpack.getByProps("heading-sm/bold");

// const tabs = {
//   repo: RepoModal,
//   commits: CommitsModal,
// };
const tabs = [
  { title: "Code", component: RepoModal, icon: CodeIcon },
  { title: "Commits", component: CommitsModal, icon: CommitIcon },
  { title: "Issues", component: Issues, icon: IssueOpenedIcon },
];

// const customTheme = deepmerge(theme)

export function GithubModal({ url, tab, ...props }: ModalProps<{ url: string; tab?: string }>) {
  const [repoInfo, setInfo] = useState<
    (components["schemas"]["repository"] & { commit: components["schemas"]["commit"] }) | null
  >(null);
  const [branches, setBranches] = useState<components["schemas"]["branch-short"][] | null>(null);
  const [selectedBranch, changeBranch] = useState<components["schemas"]["branch-short"] | null>(
    null,
  );
  const [currentTab, setTab] = useState<string>(tab || "Code");
  const [path, setPath] = useState<string>("");
  const [err, setError] = useState();
  useEffect(() => {
    (async () => {
      const repo = await getRepo(url).catch((e) => setError(e.message));
      if (!repo) return;
      const branches = await getBranches(url, { per_page: 100 });
      setBranches(branches);
      changeBranch(branches.find((branch) => branch.name === repo.default_branch)!);
      setInfo(repo as any);
    })();
  }, []);

  const Tab = tabs.find(({ title }) => title === currentTab);

  return (
    <ModalRoot {...props} className={`githubModel`}>
      <ThemeProvider theme={theme} colorMode="auto">
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
              {path ? (
                <Breadcrumbs>
                  {path.split("/").map((inPath, idx) => (
                    <Breadcrumbs.Item
                      selected={idx === path.split("/").length - 1}
                      onClick={() =>
                        setPath(
                          path
                            .split("/")
                            .splice(0, idx + 1)
                            .join("/"),
                        )
                      }>
                      {inPath}
                    </Breadcrumbs.Item>
                  ))}
                </Breadcrumbs>
              ) : (
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
              )}
            </div>
            <UnderlineNav aria-label="tabs">
              {tabs.map(({ title, icon }) => (
                <UnderlineNav.Item
                  icon={icon}
                  aria-current={title === currentTab}
                  onSelect={() => setTab(title)}>
                  {title}
                </UnderlineNav.Item>
              ))}
            </UnderlineNav>
          </div>
          {err && (
            <div className="Gerror">
              <div className={wumpus.emptyStateImage as string} />
              <span className={`Gerror-text ${wumpus.emptyStateSubtext}`}>{err}</span>
            </div>
          )}
          {!err && Tab && (
            <Tab.component
              {...{
                repo: repoInfo,
                url,
                branch: selectedBranch,
                trigger: (path) => setPath(path ?? ""),
                path,
              }}
            />
          )}
        </ModalContent>
      </ThemeProvider>
    </ModalRoot>
  );
}

export function buildGitModal(url: string, tab?: string) {
  // @ts-ignore
  common.modal.openModal((props) => <GithubModal {...props} url={url} tab={tab} />);
}
