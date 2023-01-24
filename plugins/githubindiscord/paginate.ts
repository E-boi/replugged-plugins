import * as OctokitTypes from "@octokit/types";
import { GetResponseDataTypeFromEndpointMethod } from "@octokit/types";
import { useEffect, useState } from "react";
import { Issue, getCommit, octokit, sortCommits } from "./utils";

const regex = {
  prev: /page=([0-9]+)>;\s*rel="prev"/g,
  next: /page=([0-9]+)>;\s*rel="next"/g,
  last: /page=([0-9]+)>;\s*rel="last"/g,
};

export interface Paginate<T> {
  pageInfo: {
    currentPage: number;
    lastPage?: number;
    nextPage?: number;
    prevPage?: number;
  };
  pages: T[];
}

const cache = new Map<string, unknown>();

export function usePaginate<T extends OctokitTypes.RequestInterface>(
  octokit: T,
  params: Parameters<T>[0],
) {
  const [data, setData] = useState<Paginate<GetResponseDataTypeFromEndpointMethod<T>> | null>(null);

  const fetch = (force?: boolean, savePage?: boolean, currParams?: typeof params) => {
    if (currParams) params = currParams;

    return new Promise((resolve: (value: NonNullable<typeof data>) => void) =>
      setData((prevData) => {
        // if data already exist set current page to 1 if "savePage" isn't set
        if (!force && prevData) {
          const info: Paginate<null>["pageInfo"] = {
            currentPage: savePage ? prevData.pageInfo.currentPage : 1,
            lastPage: prevData.pageInfo.lastPage,
            nextPage: prevData.pageInfo.nextPage && 2,
          };
          resolve({ ...prevData, pageInfo: info });
          return { ...prevData, pageInfo: info };
          // get from cache
        } else if (
          !force &&
          cache.has(
            JSON.stringify({
              ...(params as unknown as object),
              url: octokit.endpoint.DEFAULTS.url,
            }),
          )
        ) {
          resolve(
            cache.get(
              JSON.stringify({
                ...(params as unknown as object),
                url: octokit.endpoint.DEFAULTS.url,
              }),
            ) as NonNullable<typeof data>,
          );
          return cache.get(
            JSON.stringify({
              ...(params as unknown as object),
              url: octokit.endpoint.DEFAULTS.url,
            }),
          ) as NonNullable<typeof data>;
        }

        // get data for the first
        (async () => {
          const res = await octokit(params);
          const page = res.headers.link ? lastAndNextPage(res.headers.link) : undefined;
          const epicData: typeof data = {
            pageInfo: {
              currentPage: 1,
              lastPage: page?.last,
              prevPage: page?.prev,
              nextPage: page?.next,
            },
            pages: [res.data],
          };

          resolve(epicData);
          setData(epicData);
        })();

        return prevData;
      }),
    );
  };

  const nextPage = () => {
    return new Promise((resolve: (value: NonNullable<typeof data>) => void) =>
      setData((prevData) => {
        if (!prevData?.pageInfo.nextPage) {
          resolve(prevData!);
          return prevData;
        }

        const info = {
          currentPage: prevData.pageInfo.currentPage + 1,
          nextPage:
            prevData.pageInfo.nextPage < prevData.pageInfo.lastPage!
              ? prevData.pageInfo.nextPage + 1
              : undefined,
          prevPage: prevData.pageInfo.currentPage,
          lastPage: prevData.pageInfo.lastPage,
        };
        // if the next page has already fetch return that
        if (prevData.pages[prevData.pageInfo.nextPage - 1]) {
          resolve({
            ...prevData,
            pageInfo: info,
          });
          return {
            ...prevData,
            pageInfo: info,
          };
        }

        // fetch the next page for the first time
        (async () => {
          // @ts-expect-error die
          const res = await octokit({ ...params, page: prevData.pageInfo.nextPage });
          prevData.pages.push(res.data);
          resolve({ ...prevData, pageInfo: info });
          setData({ ...prevData, pageInfo: info });
        })();

        return prevData;
      }),
    );
  };

  const previousPage = () => {
    return new Promise((resolve: (value: NonNullable<typeof data>) => void) =>
      setData((prevData) => {
        if (!prevData?.pageInfo.prevPage) {
          resolve(prevData!);
          return prevData;
        }
        const info = {
          currentPage: prevData.pageInfo.currentPage - 1,
          nextPage: prevData.pageInfo.currentPage - 1 === 1 ? 2 : prevData.pageInfo.nextPage! - 1,
          prevPage: prevData.pageInfo.prevPage === 1 ? undefined : prevData.pageInfo.prevPage - 1,
          lastPage: prevData.pageInfo.lastPage,
        };
        resolve({ ...prevData, pageInfo: info });
        return { ...prevData, pageInfo: info };
      }),
    );
  };

  useEffect(() => {
    if (!data) return;
    // save to cache when ever "data" changes
    // console.log(params);
    cache.set(
      JSON.stringify({ ...(params as unknown as object), url: octokit.endpoint.DEFAULTS.url }),
      data,
    );
  }, [data]);

  return { data, fetch, nextPage, previousPage };
}

export function useIssues(repo: string, type: "issue" | "pr") {
  const openedPaginate = usePaginate(octokit.search.issuesAndPullRequests, {
    q: `repo:${repo} is:${type} is:open`,
  });
  const closedPaginate = usePaginate(octokit.search.issuesAndPullRequests, {
    q: `repo:${repo} is:${type} is:closed`,
  });

  const [data, setData] = useState<{
    open: Issue[][];
    closed: Issue[][];
    all: Issue[][];
    totalOpen: number;
    totalClosed: number;
    state: "open" | "closed";
  } | null>(null);

  const fetch = (force?: boolean) => {
    return new Promise((res) =>
      setData((prevData) => {
        (async () => {
          const openedRes = await openedPaginate.fetch(force);
          const closedRes = await closedPaginate.fetch(force);

          if (!prevData || force) {
            res(null);
            setData({
              all: [],
              closed: closedRes.pages.map((p) => p.items),
              open: openedRes.pages.map((p) => p.items),
              totalOpen: openedRes.pages[0].total_count,
              totalClosed: closedRes.pages[0].total_count,
              state: "open",
            });
          } else res(null);
        })();

        return prevData;
      }),
    );
  };

  const nextPage = () => {
    setData((prevData) => {
      (async () => {
        if (!prevData) return;
        const res =
          prevData.state === "open"
            ? await openedPaginate.nextPage()
            : await closedPaginate.nextPage();
        prevData[prevData.state] = res.pages.map((p) => p.items);
        setData({ ...prevData });
      })();
      return prevData;
    });
  };

  const previousPage = () => {
    setData((prevData) => {
      if (!prevData) return prevData;
      if (prevData.state === "open") void openedPaginate.previousPage();
      else void closedPaginate.previousPage();
      return prevData;
    });
  };

  const viewOpen = () => {
    setData((prev) => prev && { ...prev, state: "open" });
  };

  const viewClosed = () => {
    setData((prevData) => {
      if (prevData?.closed.length) {
        void closedPaginate.fetch(); // set page to 1
        return { ...prevData, state: "closed" };
      }
      (async () => {
        if (!prevData) return;
        const res = await closedPaginate.fetch();
        prevData.closed = res.pages.map((p) => p.items);
        // prevData.currentIdx = 1;
        prevData.state = "closed";
        prevData.totalClosed = res.pages[0].total_count;
        setData({ ...prevData });
      })();
      return prevData;
    });
  };

  return {
    data,
    fetch,
    nextPage,
    previousPage,
    viewClosed,
    viewOpen,
    info: { open: openedPaginate, closed: closedPaginate },
  };
}

export function useTimeline(url: string, issue: number) {
  const paginate = usePaginate(octokit.issues.listEventsForTimeline, {
    owner: url.split("/")[0],
    repo: url.split("/")[1],
    issue_number: issue,
  });
  const [data, setData] = useState<NonNullable<typeof paginate["data"]>["pages"][0] | null>(null);

  useEffect(() => {
    void paginate.fetch(false, true);
  }, []);

  useEffect(() => {
    if (!paginate.data?.pages) return;
    setData((prevData) => {
      (async () => {
        const data = await Promise.all(
          paginate.data!.pages.map(async (t) => {
            return await Promise.all(
              t.map(async (t) => {
                if (t.event === "committed") {
                  const commit = cache.get(`${url}${t.sha}`) || (await getCommit(url, t.sha!));
                  cache.set(`${url}${t.sha}`, commit);
                  //   @ts-expect-error now it does
                  t.commit = commit;
                }
                return t;
              }),
            );
          }),
        );
        setData([...data.flat()]);
      })();
      return prevData;
    });
  }, [paginate.data?.pages.length]);

  return { ...paginate, data: { page: data, info: paginate.data?.pageInfo } };
}

export function useCommits(url: string, { pr, branch }: { pr?: number; branch?: string }) {
  const paginate = usePaginate(pr ? octokit.pulls.listCommits : octokit.repos.listCommits, {
    owner: url.split("/")[0],
    repo: url.split("/")[1],
    pull_number: pr,
    sha: pr ? undefined : branch,
  });
  const [data, setData] = useState<Array<NonNullable<typeof paginate["data"]>["pages"]> | null>(
    null,
  );

  const fetch = async (force?: boolean, currBranch?: string) => {
    branch = currBranch;
    const page = await paginate.fetch(force, false, {
      owner: url.split("/")[0],
      repo: url.split("/")[1],
      pull_number: pr,
      sha: pr ? undefined : branch,
    });
    const pages = page.pages.map((p) => {
      return p.map((c) => {
        if (cache.has(`${url}${c.sha}`)) return cache.get(`${url}${c.sha}`) as typeof c;
        return c;
      });
    });
    const data = pages.map((p) => sortCommits(p));
    setData(data);
    return data;
  };

  const nextPage = async () => {
    const page = await paginate.nextPage();
    const data = page.pages.map((p) => {
      return p.map((c) => {
        if (cache.has(`${url}${c.sha}`)) return cache.get(`${url}${c.sha}`) as typeof c;
        return c;
      });
    });
    setData(data.map((p) => sortCommits(p)));
  };

  return { ...paginate, nextPage, fetch, data: { page: data, info: paginate.data?.pageInfo } };
}

function lastAndNextPage(link: string) {
  const last = [...link.matchAll(regex.last)][0]?.[1];
  const prev = [...link.matchAll(regex.prev)][0]?.[1];
  const next = [...link.matchAll(regex.next)][0]?.[1];
  return { last: parseInt(last, 10), prev: parseInt(prev, 10), next: parseInt(next, 10) };
}
