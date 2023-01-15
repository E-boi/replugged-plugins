import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { useEffect, useState } from "react";
import { Issue } from "./utils";

const regex = {
  prev: /page=([0-9]+)>;\s*rel="prev"/g,
  next: /page=([0-9]+)>;\s*rel="next"/g,
  last: /page=([0-9]+)>;\s*rel="last"/g,
};

export interface Paginate {
  page: {
    open: Issue[][];
    closed: Issue[][];
    all: Issue[][];
    totalOpen: number;
    totalClosed: number;
  };
  info: {
    currentPage: number;
    pages: {
      open?: Page;
      closed?: Page;
      all?: Page;
    };
  };
  state: "open" | "closed";
  nextPage: () => void;
  previousPage: () => void;
  viewClosed: () => void;
  viewOpen: () => void;
}

interface Page {
  prev?: number;
  next?: number;
  last: number;
}

const cache = new Map<string, { info: Paginate["info"]["pages"]; page: Paginate["page"] }>();

export function usePaginate(
  Octokit: Octokit,
  params: RestEndpointMethodTypes["search"]["issuesAndPullRequests"]["parameters"],
  { force, onError }: { force?: boolean; onError: (err: string) => void },
) {
  const [page, setPage] = useState<Paginate["page"]>({
    open: [],
    closed: [],
    all: [],
    totalClosed: 0,
    totalOpen: 0,
  });
  const [pageInfo, setPageInfo] = useState<Paginate["info"]>({
    currentPage: 1,
    pages: {},
  });
  const [state, setState] = useState<"open" | "closed">("open");

  useEffect(() => {
    try {
      (async () => {
        if (!force && cache.has(params.q)) {
          setPage(cache.get(params.q)!.page);
          setPageInfo({ currentPage: 1, pages: cache.get(params.q)!.info });
          return;
        } else cache.forEach((_, k) => k === params.q && cache.delete(k));
        const openedIssues = await Octokit.search.issuesAndPullRequests({
          ...params,
          q: `${params.q} state:open`,
        });
        setPage({
          all: [],
          closed: [],
          open: [[...openedIssues.data.items]],
          totalOpen: openedIssues.data.total_count,
          totalClosed: 0,
        });

        const info = openedIssues.headers.link
          ? lastAndNextPage(openedIssues.headers.link)
          : undefined;
        setPageInfo({ currentPage: 1, pages: { open: info } });
        setState("open");
        cache.set(params.q, {
          info: {
            open: info,
          },
          page: {
            all: [],
            closed: [],
            open: [[...openedIssues.data.items]],
            totalClosed: 0,
            totalOpen: openedIssues.data.total_count,
          },
        });
      })();
    } catch (err) {
      // @ts-expect-error stfu
      onError(err.message as string);
    }
  }, [force]);

  const nextPage = () => {
    try {
      // "page" won't be update to date so use this
      setPage((prevPageState) => {
        setPageInfo((prevInfoState) => {
          const info = prevInfoState.pages[state];
          if (!info?.next) return prevInfoState;
          // setting the next page
          if (prevPageState[state].length >= info.next) {
            info.prev = prevInfoState.currentPage;
            if (info.last <= info.next) info.next = undefined;
            else ++info.next;
            ++prevInfoState.currentPage;
            return { ...prevInfoState };
          }
          (async () => {
            if (!info?.next) return;
            const request = await Octokit.search.issuesAndPullRequests({
              ...params,
              q: `${params.q} state:${state}`,
              page: info.next,
            });
            prevPageState[state].push([...request.data.items]);
            setPage(prevPageState);
            setPageInfo((p) => ({
              currentPage: ++prevInfoState.currentPage,
              pages: {
                ...p.pages,
                [state]: { ...lastAndNextPage(request.headers.link!), last: p.pages[state]!.last },
              },
            }));
          })();
          return prevInfoState;
        });
        // return we only need the current state
        return prevPageState;
      });
    } catch (err) {
      // @ts-expect-error stfu
      onError(err.message);
    }
  };

  const previousPage = () => {
    setPage((prevPageState) => {
      setPageInfo((prevInfoState) => {
        const info = prevInfoState.pages[state];
        if (!info?.prev) return prevInfoState;
        if (prevInfoState.currentPage === 2) info.prev = undefined;
        else --info.prev;
        --prevInfoState.currentPage;
        const next = info.next! || info.last;
        info.next = next - 1;
        return { ...prevInfoState };
      });
      return prevPageState;
    });
  };

  const viewClosed = () => {
    setPage((prevPageState) => {
      setPageInfo((prevInfoState) => {
        if (prevInfoState.pages[state]) {
          prevInfoState.pages[state]!.next = 2;
          prevInfoState.pages[state]!.prev = undefined;
        }
        return { ...prevInfoState, currentPage: 1 };
      });
      if (prevPageState.closed.length) {
        setState("closed");
        return { ...prevPageState };
      } else {
        setPageInfo((prevInfoState) => {
          (async () => {
            const closedIssues = await Octokit.search.issuesAndPullRequests({
              ...params,
              q: `${params.q} state:closed`,
            });
            setPage((prev) => ({
              ...prev,
              closed: [[...closedIssues.data.items]],
              totalClosed: closedIssues.data.total_count,
            }));

            const info = closedIssues.headers.link
              ? lastAndNextPage(closedIssues.headers.link)
              : undefined;

            setPageInfo((prev) => ({ ...prev, pages: { ...prev.pages, closed: info } }));
            setState("closed");
          })();
          return prevInfoState;
        });
      }
      return prevPageState;
    });
  };

  const viewOpen = () => {
    setPageInfo((prevInfoState) => {
      if (prevInfoState.pages[state]) {
        prevInfoState.pages[state]!.next = 2;
        prevInfoState.pages[state]!.prev = undefined;
      }
      return { ...prevInfoState, currentPage: 1 };
    });
    setState("open");
  };

  useEffect(() => {
    cache.set(params.q, { info: pageInfo.pages, page });
  }, [pageInfo, page]);

  return { info: pageInfo, page, nextPage, previousPage, state, viewClosed, viewOpen };
}

function lastAndNextPage(link: string) {
  const last = [...link.matchAll(regex.last)][0]?.[1];
  const prev = [...link.matchAll(regex.prev)][0]?.[1];
  const next = [...link.matchAll(regex.next)][0]?.[1];
  return { last: parseInt(last, 10), prev: parseInt(prev, 10), next: parseInt(next, 10) };
}
