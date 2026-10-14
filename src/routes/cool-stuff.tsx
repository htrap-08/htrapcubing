import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/cool-stuff")({
  beforeLoad: ({ location }) => {
    throw redirect({
      href:
        "/scrambledeggs/cool-stuff" +
        location.searchStr +
        (location.hash ? "#" + location.hash : ""),
      statusCode: 301,
    });
  },
});
