import { ModalProps } from "../Modals";
import { abbreviateNumber, getBranches, getRepo } from "../utils";
import {
  CodeIcon,
  CommitIcon,
  GitBranchIcon,
  IssueOpenedIcon,
  LinkExternalIcon,
  LockIcon,
  RepoForkedIcon,
  RepoIcon,
  StarIcon,
  TagIcon,
} from "@primer/styled-octicons";
import { Breadcrumbs, Button, ButtonGroup, Label, Text, ThemeProvider, theme } from "@primer/react";
import { UnderlineNav } from "@primer/react/drafts";
import { SelectMenu } from "../components";
import CommitsModal from "./CommitsModal";
import RepoModal from "./RepoModal";
// @ts-ignore wait for rp to update package
import { common, components as rpC, webpack } from "replugged";
import { useEffect, useState } from "react";
import Issues from "./Issues";
import { components } from "@octokit/openapi-types";
import deepmerge from "deepmerge";

const discordtheme = deepmerge(theme, {
  colorSchemes: {
    dark: {
      colors: {
        border: {
          default: "var(--primary-dark-700)",
          muted: "var(--primary-dark-700)",
          subtle: "var(--primary-dark-700)",
        },
        btn: {
          text: "var(--text-normal)",
          bg: "var(--button-secondary-background)",
          border: "transparent",
          hoverBg: "var(--button-secondary-background-hover)",
          hoverBorder: "transparent",
          activeBg: "red",
          activeBorder: "transparent",
          selectedBg: "red",
          focusBg: "red",
          focusBorder: "transparent",
          counterBg: "rgba(27,31,36,0.08)",
          primary: {
            text: "var(--text-normal)",
            bg: "#2da44e",
            border: "transparent",
            hoverBg: "#2c974b",
            hoverBorder: "transparent",
            selectedBg: "hsla(137,55%,36%,1)",
            disabledText: "rgba(255,255,255,0.8)",
            disabledBg: "#94d3a2",
            disabledBorder: "transparent",
            focusBg: "#2da44e",
            focusBorder: "transparent",
            icon: "rgba(255,255,255,0.8)",
            counterBg: "rgba(255,255,255,0.2)",
          },
        },
      },
    },
  },
});

const { ModalContent, ModalHeader, ModalRoot } = rpC.Modal;
const wumpus = {
  ...webpack.getByProps("emptyStateImage", "emptyStateSubtext"),
};

const textClasses = webpack.getByProps("heading-lg/bold");

// const tabs = {
//   repo: RepoModal,
//   commits: CommitsModal,
// };
const tabs = [
  { title: "Code", component: RepoModal, icon: CodeIcon },
  { title: "Commits", component: CommitsModal, icon: CommitIcon },
  { title: "Issues", component: Issues, icon: IssueOpenedIcon },
];

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
      <ThemeProvider theme={discordtheme} colorMode="dark">
        <ModalHeader className="githeader">
          <div className="repository-info">
            <div className="repo-path">
              <div className="repo-visibility-icon">
                {repoInfo?.visibility === "private" ? (
                  <LockIcon size={16} sx={{ mr: 2 }} />
                ) : (
                  <RepoIcon size={16} sx={{ mr: 2 }} />
                )}
              </div>
              <Breadcrumbs>
                <Breadcrumbs.Item
                  href={repoInfo?.owner.html_url}
                  className={textClasses?.["heading-lg/normal"]}
                  target="_blank">
                  {repoInfo?.owner.login}
                </Breadcrumbs.Item>
                <Breadcrumbs.Item
                  href={repoInfo?.html_url}
                  className={textClasses?.["heading-lg/medium"]}
                  target="_blank">
                  {repoInfo?.name}
                </Breadcrumbs.Item>
              </Breadcrumbs>
              <Label className="visibility">{repoInfo?.visibility}</Label>
            </div>
            <div className={[textClasses?.["heading-sm/medium"], "extlink-buttons"].join(" ")}>
              {repoInfo && (
                <ButtonGroup sx={{ display: "flex" }}>
                  <Button leadingIcon={StarIcon} verticalAlign={"middle"} sx={{ mr: 1 }}>
                    Stars
                    <Button.Counter>{abbreviateNumber(repoInfo?.stargazers_count)}</Button.Counter>
                  </Button>
                  <Button>
                    <a className="starLink" href={`${repoInfo.html_url}/stargazers`} target="_blank">
                      <LinkExternalIcon size={16} />
                    </a>
                  </Button>
                </ButtonGroup>
              )}
              {repoInfo && (
                <ButtonGroup sx={{ display: "flex" }}>
                  <Button leadingIcon={RepoForkedIcon} verticalAlign={"middle"} sx={{ mr: 1 }}>
                    Fork
                    <Button.Counter>{abbreviateNumber(repoInfo.forks_count)}</Button.Counter>
                  </Button>
                  <Button>
                    <a
                      className="forklink"
                      href={`${repoInfo?.html_url}/network/members`}
                      target="_blank">
                      <LinkExternalIcon size={16} />
                    </a>
                  </Button>
                </ButtonGroup>
              )}
            </div>
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
            </div>
            {path ? (
              <Breadcrumbs className={textClasses?.["heading-md/bold"]}>
                <Breadcrumbs.Item onClick={() => setPath("")}>{repoInfo?.name}</Breadcrumbs.Item>
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
                  <GitBranchIcon size={16} />
                  <Text className={textClasses?.["heading-sm/bold"]} sx={{ mx: 1 }}>
                    {branches?.length}
                  </Text>
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
          {err && textClasses && (
            <div className="Gerror">
              <div className={wumpus.emptyStateImage as string} />
              <span
                className={[textClasses?.["heading-lg/normal"], `${wumpus.emptyStateSubtext}`].join(
                  " ",
                )}>
                {err}
              </span>
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
