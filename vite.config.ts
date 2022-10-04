/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import * as path from "path";
import svgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import rollupNodePolyFill from "rollup-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    resolve: {
      alias: {
        process: path.resolve(__dirname, "src/polyfills/process-es6.js"),
        util: "rollup-plugin-node-polyfills/polyfills/util",
        sys: "util",
        events: "rollup-plugin-node-polyfills/polyfills/events",
        stream: "rollup-plugin-node-polyfills/polyfills/stream",
        path: "rollup-plugin-node-polyfills/polyfills/path",
        querystring: "rollup-plugin-node-polyfills/polyfills/qs",
        punycode: "rollup-plugin-node-polyfills/polyfills/punycode",
        url: "rollup-plugin-node-polyfills/polyfills/url",
        // string_decoder: "rollup-plugin-node-polyfills/polyfills/string-decoder",
        http: "rollup-plugin-node-polyfills/polyfills/http",
        https: "rollup-plugin-node-polyfills/polyfills/http",
        os: "rollup-plugin-node-polyfills/polyfills/os",
        assert: "rollup-plugin-node-polyfills/polyfills/assert",
        // constants: "rollup-plugin-node-polyfills/polyfills/constants",
        _stream_duplex:
          "rollup-plugin-node-polyfills/polyfills/readable-stream/duplex",
        _stream_passthrough:
          "rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough",
        _stream_readable:
          "rollup-plugin-node-polyfills/polyfills/readable-stream/readable",
        _stream_writable:
          "rollup-plugin-node-polyfills/polyfills/readable-stream/writable",
        _stream_transform:
          "rollup-plugin-node-polyfills/polyfills/readable-stream/transform",
        timers: "rollup-plugin-node-polyfills/polyfills/timers",
        console: "rollup-plugin-node-polyfills/polyfills/console",
        vm: "rollup-plugin-node-polyfills/polyfills/vm",
        zlib: "rollup-plugin-node-polyfills/polyfills/zlib",
        tty: "rollup-plugin-node-polyfills/polyfills/tty",
        domain: "rollup-plugin-node-polyfills/polyfills/domain",
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
        plugins: [rollupNodePolyFill()],
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: "globalThis",
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: false,
            buffer: false,
          }),
          NodeModulesPolyfillPlugin(),
        ],
      },
    },
  };
});
