import {
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
  ModalRoot,
  openModal,
} from "../Modals";
import { Branch, Repo, getBranches, getRepo } from "../utils";
import { SelectMenu, TabBar } from "../components";
import CommitsModal from "./CommitsModal";
import RepoModal from "./RepoModal";
import { webpack } from "replugged";
import { useEffect, useState } from "react";

const StarSvg = "https://raw.githubusercontent.com/E-boi/assets/main/star.svg";
const ForkSvg = "https://raw.githubusercontent.com/E-boi/assets/main/ghfork.svg";

const wumpus = {
  ...webpack.getByProps("emptyStateImage", "emptyStateSubtext"),
};

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
  const key = "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";
  useEffect(() => {
    (async () => {
      const repo = await getRepo(url, key).catch((e) => setError(e.message));
      if (!repo) return;
      const branches = await getBranches(url, key);
      setBranches(branches);
      changeBranch(branches.find((branch) => branch.name === repo.default_branch)!);
      setInfo(repo);
    })();
  }, []);

  const Tab = tabs[tab];

  return (
    <ModalRoot {...props} className={`githubModel`}>
      <ModalHeader>
        <a
          className="repo-name"
          href={repoInfo?.html_url || `https://github.com/${url}`}
          target="_blank">
          {repoInfo?.name || url}
        </a>
        {repoInfo && (
          <a className="star-svg" href={`${repoInfo.html_url}/stargazers`} target="_blank">
            <img src={StarSvg} />
            <p>{repoInfo.stargazers_count}</p>
          </a>
        )}
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
      </ModalHeader>
      <ModalContent>
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
        {err && (
          <div className="Gerror">
            <div className={wumpus.emptyStateImage as string} />
            <p className={`Gerror-text ${wumpus.emptyStateSubtext}`}>{err}</p>
          </div>
        )}
        {!err && <Tab {...{ repo: repoInfo, url, branch: selectedBranch }} />}
      </ModalContent>
      <ModalFooter>
        <ModalCloseButton />
        {repoInfo && (
          <div className="repo-info">
            <a className="owner-profile" href={repoInfo.owner.html_url} target="_blank">
              <img height={32} width={32} src={repoInfo.owner.avatar_url} />
              <p>{repoInfo.owner.login}</p>
            </a>
            <a className="fork-svg" href={`${repoInfo.html_url}/network/members`} target="_blank">
              <img src={ForkSvg} />
              <p>{repoInfo.forks}</p>
            </a>
          </div>
        )}
      </ModalFooter>
    </ModalRoot>
  );
}

export function buildGitModal(url: string) {
  openModal((props) => <GithubModal {...props} url={url} />);
}
