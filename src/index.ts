import { cors } from "hono/cors";
// import { showRoutes } from "hono/dev";
import routers from "./app";
import { createRouter } from "./helpers/hono";

const app = createRouter();

app.use("*", cors());

app.route("/api", routers);

export default app;
