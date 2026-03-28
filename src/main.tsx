import { ThemeProvider } from "@emotion/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider, getChainOptions } from "@xpla/wallet-provider";
import ReactDOM from "react-dom/client";
import ResizeObserver from "resize-observer-polyfill";

import "simplebar";
import "simplebar/dist/simplebar.css";

import theme from "~/styles/theme";

import "~/utils/overrideXplaNumeric";

import { GrazProvider } from "~/components/Providers/GrazProvider";

import App from "./App";

window.ResizeObserver = ResizeObserver;

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root")!);

getChainOptions().then((chainOptions) => {
  root.render(
    <WalletProvider {...chainOptions}>
      <QueryClientProvider client={queryClient}>
        <GrazProvider>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </GrazProvider>
      </QueryClientProvider>
    </WalletProvider>,
  );
});
