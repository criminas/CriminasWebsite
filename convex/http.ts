import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Set up the auth HTTP routes at /.auth/*
auth.addHttpRoutes(http);

export default http;
