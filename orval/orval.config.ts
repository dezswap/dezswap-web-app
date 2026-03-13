import { defineConfig } from "orval";

export default defineConfig({
  dezswap: {
    input: {
      target: "./openapi.dezswap.json",
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
      // Required to encode address of native tokens e.g. "ibc/1234567890" in query parameters.
      urlEncodeParameters: true,
      prettier: true,
      clean: true,
    },
  },
});
