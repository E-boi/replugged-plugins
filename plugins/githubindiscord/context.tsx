import { ReactNode, createContext } from "react";
import { RepoQuery, useRepo } from "./utils";

export const Context = createContext<ReturnType<typeof useRepo> | null>(null);

export const Provider = ({
  children,
  url,
  query,
}: {
  children: ReactNode;
  url: string;
  query: RepoQuery;
}) => {
  const repo = useRepo({ url, query });

  return <Context.Provider value={repo}>{children}</Context.Provider>;
};
