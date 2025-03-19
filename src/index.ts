import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import routers from "./app";
import createRouter from "./lib/hono";

const app = createRouter();

app.use(cors());
app.use(prettyJSON());

app.route("/", routers);

export default app;
