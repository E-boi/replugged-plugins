import {
  BaseStyles,
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Label,
  Text,
  ThemeProvider,
} from "@primer/react";
import { UnderlineNav } from "@primer/react/drafts";
import {
  CodeIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  LinkExternalIcon,
  LockIcon,
  RepoForkedIcon,
  RepoIcon,
  StarIcon,
  // TagIcon,
} from "@primer/styled-octicons";
import { FC, useLayoutEffect, useState } from "react";
import { common, components } from "replugged";
import { ModalProps } from "../Modals";
import {
  Branch,
  Issue,
  TreeWithContent,
  abbreviateNumber,
  pluginSettings,
  useRepo,
} from "../utils";
import Code from "./Code";
import Issues from "./Issues";
import Pulls from "./Pulls";
// import Tags from "./Tags";
import theme from "../theme";
import Spinner from "./Spinner";
import { textClasses, wumpus } from "../components";
import { components as ght } from "@octokit/openapi-types";

const { ModalContent, ModalHeader, ModalRoot } = components.Modal;

const tabs = [
  { title: "Code", component: Code, icon: CodeIcon },
  { title: "Issues", component: Issues, icon: IssueOpenedIcon },
  { title: "Pull Requests", component: Pulls, icon: GitPullRequestIcon },
];

export interface TabProps {
  repo: ght["schemas"]["full-repository"];
  tags: Array<ght["schemas"]["tag"]>;
  tree: TreeWithContent[];
  issues: { total: number; open: Issue[]; closed: Issue[]; all: Issue[] };
  prs: { total: number; open: Issue[]; closed: Issue[]; all: Issue[] };
  branches: Branch[];
  branch: Branch;
  url: string;
  switchBranches: (branch: string) => void;
}

const GithubModal: FC<ModalProps & { url: string; tab: string }> = ({ url, tab, ...props }) => {
  const [selectedBranch, setBranch] = useState<Branch>();
  const {
    data: repo,
    error,
    status,
  } = useRepo({
    url,
    query: { issues: { state: "all" }, prs: { state: "open" }, branch: selectedBranch?.name },
  });
  const [currentTab, setTab] = useState<string>(tab || "Code");

  useLayoutEffect(() => {
    if (!repo?.branches || selectedBranch) return;
    setBranch(repo.branches.find((b) => b.name === repo.repo.default_branch));
  }, [repo]);

  const Tab = tabs.find(({ title }) => title === currentTab);
  return (
    <ThemeProvider
      colorMode="auto"
      theme={theme}
      nightScheme={pluginSettings.get("darkTheme", "dark_discord")}
      dayScheme={pluginSettings.get("lightTheme", "light_discord")}>
      <BaseStyles bg="canvas.default">
        <ModalRoot {...props} className="githubModel">
          <ModalHeader>
            <Box className="repo-info">
              <Text className="repo-path">
                {repo?.repo.visibility === "private" ? (
                  <LockIcon className="repo-visibility-icon" size={16} />
                ) : (
                  <RepoIcon className="repo-visibility-icon" size={16} />
                )}
                <Breadcrumbs>
                  <Breadcrumbs.Item
                    href={repo?.repo.owner.html_url}
                    className={textClasses?.["heading-lg/normal"]}
                    target="_blank">
                    {repo?.repo?.owner.login}
                  </Breadcrumbs.Item>
                  <Breadcrumbs.Item
                    href={repo?.repo.html_url}
                    className={textClasses?.["heading-lg/medium"]}
                    target="_blank">
                    {repo?.repo.name}
                  </Breadcrumbs.Item>
                </Breadcrumbs>
                <Label className="visibility">{repo?.repo.visibility}</Label>
              </Text>

              <div className={[textClasses?.["heading-sm/medium"], "extlink-buttons"].join(" ")}>
                <ButtonGroup sx={{ display: "flex" }}>
                  <Button leadingIcon={StarIcon} verticalAlign={"middle"} sx={{ mr: 1 }}>
                    Stars
                    <Button.Counter>
                      {abbreviateNumber(repo?.repo.stargazers_count ?? 0) as unknown as number}
                    </Button.Counter>
                  </Button>
                  <Button>
                    <a
                      className="starLink"
                      href={`${repo?.repo.html_url}/stargazers`}
                      target="_blank">
                      <LinkExternalIcon size={16} />
                    </a>
                  </Button>
                </ButtonGroup>
                <ButtonGroup sx={{ display: "flex" }}>
                  <Button leadingIcon={RepoForkedIcon} verticalAlign={"middle"} sx={{ mr: 1 }}>
                    Fork
                    <Button.Counter>
                      {abbreviateNumber(repo?.repo.forks_count ?? 0) as unknown as number}
                    </Button.Counter>
                  </Button>
                  <Button>
                    <a
                      className="forklink"
                      href={`${repo?.repo.html_url}/network/members`}
                      target="_blank">
                      <LinkExternalIcon size={16} />
                    </a>
                  </Button>
                </ButtonGroup>
              </div>
            </Box>
            <UnderlineNav aria-label="Repository">
              {tabs.map(({ title, icon }) => (
                <UnderlineNav.Item
                  icon={icon}
                  aria-current={title === currentTab}
                  onSelect={() => setTab(title)}
                  counter={
                    title === "Issues"
                      ? abbreviateNumber(repo?.issues.total ?? 0)
                      : title === "Pull Requests"
                      ? abbreviateNumber(repo?.prs.total ?? 0)
                      : // eslint-disable-next-line no-undefined
                        undefined
                  }>
                  {title}
                </UnderlineNav.Item>
              ))}
            </UnderlineNav>
          </ModalHeader>
          <ModalContent>
            {status === "loading" ? (
              <Spinner>Fetching Repository Contents...</Spinner>
            ) : status === "err" ? (
              <div>
                <div className="Gerror">
                  <div className={wumpus.emptyStateImage as string} />
                  <span
                    className={[
                      textClasses?.["heading-lg/normal"],
                      `${wumpus.emptyStateSubtext}`,
                    ].join(" ")}>
                    {error}
                  </span>
                </div>
              </div>
            ) : (
              Tab &&
              repo &&
              repo.tree &&
              selectedBranch && (
                <Tab.component
                  {...repo}
                  url={url}
                  branch={selectedBranch}
                  switchBranches={(branch: string) =>
                    setBranch(repo.branches.find((b) => b.name === branch))
                  }
                />
              )
            )}
          </ModalContent>
        </ModalRoot>
      </BaseStyles>
    </ThemeProvider>
  );
};

export function openGithubModal(url: string, tab: string) {
  common.modal.openModal((props) => <GithubModal {...props} url={url} tab={tab} />);
}
