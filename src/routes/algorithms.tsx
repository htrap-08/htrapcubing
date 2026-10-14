import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/algorithms")({
  beforeLoad: ({ location }) => {
    throw redirect({
      href:
        "/scrambledeggs/algorithms" +
        location.searchStr +
        (location.hash ? "#" + location.hash : ""),
      statusCode: 301,
    });
  },
});
