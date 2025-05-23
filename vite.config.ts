/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
        include: "**/*.tsx",
      }),
      tsconfigPaths(),
      svgr(),
      basicSsl(),
      nodePolyfills({
        exclude: ["fs", "constants"],
        protocolImports: false,
      }),
    ],
    resolve: {
      alias: {
        "@interchainjs": path.resolve(__dirname, "node_modules/@interchainjs"),
      },
    },
    server: {
      port: Number(env.port) || undefined,
      https: true,
    },
    optimizeDeps: {},
  };
});
