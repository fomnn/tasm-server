import { cors } from "hono/cors";
import { logger } from "hono/logger";
// import { showRoutes } from "hono/dev";
import routers from "./app";
import { createRouter } from "./helpers/hono";

const app = createRouter();

app.use("*", cors());
app.use("*", logger());

app.route("/api", routers);

export default app;
