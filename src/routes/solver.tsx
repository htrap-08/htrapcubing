import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/solver")({
  beforeLoad: ({ location }) => {
    throw redirect({
      href:
        "/scrambledeggs/solver" + location.searchStr + (location.hash ? "#" + location.hash : ""),
      statusCode: 301,
    });
  },
});
