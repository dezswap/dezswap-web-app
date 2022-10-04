/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import inject from "@rollup/plugin-inject";
import * as path from "path";
import svgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    resolve: {
      alias: {
        "@xpla/xpla.js": "@xpla/xpla.js/dist/bundle.js",
        process: path.resolve(__dirname, "public/polyfills/process-es6.js"),
        "readable-stream": "vite-compatible-readable-stream",
      },
    },
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
    ],
    server: {
      port: Number(env.port) || undefined,
      https: true,
    },

    build: {
      rollupOptions: {
        plugins: [inject({ Buffer: ["Buffer", "Buffer"] })],
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: "globalThis",
        },
      },
    },
  };
});
