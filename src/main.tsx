import { ThemeProvider } from "@emotion/react";
import { ChainProvider } from "@interchain-kit/react";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { getChainOptions, WalletProvider } from "@xpla/wallet-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "App";
import theme from "styles/theme";
import ResizeObserver from "resize-observer-polyfill";
import ReactDOM from "react-dom/client";
import "simplebar";
import "simplebar/dist/simplebar.css";
import "utils/overrideXplaNumeric";
import {
  DefaultAssetList,
  DefaultChain,
  DefaultRpcEndpoint,
} from "constants/dezswap";

window.ResizeObserver = ResizeObserver;

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root")!);
const a = {
  chains: [DefaultChain],
  assetLists: [DefaultAssetList],
  wallets: [keplrWallet],
  signerOptions: {
    signing: () => {
      return {
        broadcast: {
          checkTx: true,
          deliverTx: true,
        },
      };
    },
  },
  endpointOptions: {
    endpoints: {
      injective: {
        rpc: [DefaultRpcEndpoint],
      },
    },
  },
};
getChainOptions().then((chainOptions) => {
  root.render(
    <WalletProvider {...chainOptions}>
      <ChainProvider {...a}>
        {/* TODO fix type error */}
        {/* @ts-ignore */}
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </QueryClientProvider>
      </ChainProvider>
    </WalletProvider>,
  );
});
