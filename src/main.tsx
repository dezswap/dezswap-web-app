import { ThemeProvider } from "@emotion/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider, getChainOptions } from "@xpla/wallet-provider";
import ReactDOM from "react-dom/client";
import ResizeObserver from "resize-observer-polyfill";

import "simplebar";
import "simplebar/dist/simplebar.css";

import theme from "~/styles/theme";

import "~/utils/overrideXplaNumeric";

import { InterchainProvider } from "~/components/Providers/InterchainProvider";

import App from "./App";

window.ResizeObserver = ResizeObserver;

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root")!);

getChainOptions().then((chainOptions) => {
  root.render(
    <WalletProvider {...chainOptions}>
      <InterchainProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </QueryClientProvider>
      </InterchainProvider>
    </WalletProvider>,
  );
});
