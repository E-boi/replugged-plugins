import { ReactNode, createContext } from "react";
import { RepoQuery } from "./utils";
import useRepo from "./useRepo";
import { GithubLink } from ".";

export const Context = createContext<ReturnType<typeof useRepo> | null>(null);

export const Provider = ({
  children,
  link,
  query,
}: {
  children: ReactNode;
  link: GithubLink;
  query: RepoQuery;
}) => {
  const repo = useRepo(link, query);

  return <Context.Provider value={repo}>{children}</Context.Provider>;
};
