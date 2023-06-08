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
  CommitIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  LinkExternalIcon,
  LockIcon,
  RepoForkedIcon,
  RepoIcon,
  StarIcon,
} from "@primer/styled-octicons";
import { FC, useContext, useState } from "react";
import { common, components, webpack } from "replugged";
import { ModalProps } from "../Modals";
import { abbreviateNumber, pluginSettings } from "../utils";
import Code from "./Code";
import Issues from "./Issues";
import Pulls from "./Pulls";
import theme from "../theme";
import Spinner from "./Spinner";
import { textClasses } from "../components";
import { Context, Provider } from "../context";
import ErrorBoundary from "./ErrorBoundary";
import Commits from "./Commits";

const { ModalContent, ModalHeader, ModalRoot } = components.Modal;

const tabs = [
  { title: "Code", component: Code, icon: CodeIcon },
  { title: "Commits", component: Commits, icon: CommitIcon },
  { title: "Issues", component: Issues, icon: IssueOpenedIcon },
  { title: "Pull Requests", component: Pulls, icon: GitPullRequestIcon },
];

const GithubModal: FC<ModalProps & { tab: string }> = ({ tab, ...props }) => {
  const { data: repo, issues, prs, status } = useContext(Context)!;
  const [currentTab, setTab] = useState<string>(tab || "Code");

  const Tab = tabs.find(({ title }) => title === currentTab);
  return (
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
              <Button leadingIcon={StarIcon} sx={{ mr: 1 }}>
                Stars
                <Button.Counter>
                  {abbreviateNumber(repo?.repo.stargazers_count ?? 0) as unknown as number}
                </Button.Counter>
              </Button>
              <Button>
                <a className="starLink" href={`${repo?.repo.html_url}/stargazers`} target="_blank">
                  <LinkExternalIcon size={16} />
                </a>
              </Button>
            </ButtonGroup>
            <ButtonGroup sx={{ display: "flex" }}>
              <Button leadingIcon={RepoForkedIcon} sx={{ mr: 1 }}>
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
                  ? abbreviateNumber(issues.data?.totalOpen ?? 0)
                  : title === "Pull Requests"
                  ? abbreviateNumber(prs.data?.totalOpen ?? 0)
                  : undefined
              }>
              {title}
            </UnderlineNav.Item>
          ))}
        </UnderlineNav>
      </ModalHeader>
      <ModalContent>
        {status === "loading" ? (
          <Spinner>Fetching Repository Contents...</Spinner>
        ) : (
          Tab && repo && repo.tree && <Tab.component />
        )}
      </ModalContent>
      {/* <ModalFooter>
        <ButtonGroup>
          <Button
            onClick={() =>
              refetch(
                {
                  issues: { state: "open" },
                  prs: { state: "open" },
                  branch: repo?.currentBranch.name,
                },
                true,
              )
            }>
            Refetch Repository
          </Button>
          <Button onClick={openSettingsModal}>Open Settings</Button>
        </ButtonGroup>
      </ModalFooter> */}
    </ModalRoot>
  );
};

export function openGithubModal(url: string, tab: string) {
  common.modal.openModal((props) => (
    <ErrorBoundary modalProps={props}>
      <ThemeProvider
        colorMode={webpack.getByProps<{ theme: "dark" | "light" }>("theme")?.theme || "auto"}
        theme={theme}
        nightScheme={pluginSettings.get("darkTheme", "dark_discord")}
        dayScheme={pluginSettings.get("lightTheme", "light_discord")}>
        <BaseStyles>
          <Provider query={{ issues: { state: "open" }, prs: { state: "open" } }} url={url}>
            <Box sx={{ ".githubModel": { bg: "canvas.default" } }}>
              <GithubModal {...props} tab={tab} />
            </Box>
          </Provider>
        </BaseStyles>
      </ThemeProvider>
    </ErrorBoundary>
  ));
}
