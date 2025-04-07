import { createRouter } from "../helpers/hono";

export const imageRouter = createRouter()
  .basePath("/images")
  .get("/*", async (c) => {
    const filepath = c.req.path.split("/api/images/")[1];
    const bucket = c.env.tasm_bucket;
    const file = await bucket.get(filepath);

    if (!file) {
      return c.json({
        message: "image not found",
      }, 404);
    }

    return c.body(file.body);
  });
