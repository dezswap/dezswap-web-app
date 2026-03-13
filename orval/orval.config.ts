import { defineConfig } from "orval";

export default defineConfig({
  dezswap: {
    input: {
      target: "./swagger.dezswap.json",
      // TODO: fix host field from api server to pass validation
      // target: "https://dimension-api.dezswap.io/swagger/doc.json",
      override: {
        transformer: "./swagger-transformer.js",
      },
    },
    output: {
      workspace: "../src/api/dezswap",
      target: "./endpoints",
      schemas: "./models",
      client: "react-query",
      httpClient: "axios",
      mode: "tags-split",
      // mock: true, // TODO: enable after installing msw + @faker-js/faker
      override: {
        mutator: {
          path: "../custom-instance.ts",
          name: "customInstance",
        },
      },
      prettier: true,
      clean: true,
    },
  },
});
