import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

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
    },
    optimizeDeps: {},
    build: {
      assetsInlineLimit: 0, // This is important for inlining SVGs
      rollupOptions: {
        output: {
          manualChunks: {
            "xpla-vendor": [
              "@xpla/xpla",
              "@xpla/wallet-provider",
              "@xpla/wallet-controller",
              "@xpla/xpla.js",
            ],
            "interchain-kit-vendor": [
              "@interchain-kit/react",
              "@interchain-kit/core",
            ],
          },
        },
      },
    },
  };
});
