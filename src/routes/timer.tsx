import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/timer")({
  beforeLoad: ({ location }) => {
    throw redirect({
      href:
        "/scrambledeggs/timer" + location.searchStr + (location.hash ? "#" + location.hash : ""),
      statusCode: 301,
    });
  },
});
