import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { getServiceStatusesAction } from "./status";

const http = httpRouter();

// Set up the auth HTTP routes at /.auth/*
auth.addHttpRoutes(http);

http.route({
  path: "/api/status/getServiceStatuses",
  method: "GET",
  handler: getServiceStatusesAction,
});

export default http;
