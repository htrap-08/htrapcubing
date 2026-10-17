import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const homepageReload =
    typeof window !== "undefined" &&
    window.location.pathname === "/" &&
    (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)
      ?.type === "reload";

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: ({ location }) => !(homepageReload && location.pathname === "/"),
    defaultPreloadStaleTime: 0,
  });

  return router;
};
