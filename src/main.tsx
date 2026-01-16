import { ThemeProvider } from "@emotion/react";
import { WCWallet } from "@interchain-kit/core";
import { cosmostationWallet } from "@interchain-kit/cosmostation-extension";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { ChainProvider } from "@interchain-kit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider, getChainOptions } from "@xpla/wallet-provider";
import { defaultSignerOptions } from "@xpla/xpla/defaults";
import ReactDOM from "react-dom/client";
import ResizeObserver from "resize-observer-polyfill";
import "simplebar";
import "simplebar/dist/simplebar.css";

import {
  DefaultAssetList,
  DefaultChain,
  DefaultRpcEndpoint,
} from "~/constants/dezswap";

import theme from "~/styles/theme";

import "~/utils/overrideXplaNumeric";

import App from "./App";

window.ResizeObserver = ResizeObserver;

const queryClient = new QueryClient();
const defaultOption = {
  projectId: import.meta.env.VITE_PROJECT_ID,
  relayUrl: "wss://relay.walletconnect.org",
  metadata: {
    name: "Dezswap",
    description: "Dezswap",
    url: window.location.origin,
    icons: [
      "https://walletconnect.com/walletconnect-logo.png",
      "https://app.dezswap.io/favicon.svg",
    ],
  },
};
const walletConnect = new WCWallet(undefined, defaultOption);

const root = ReactDOM.createRoot(document.getElementById("root")!);

const interchainOptions = {
  chains: DefaultChain,
  assetLists: DefaultAssetList,
  wallets: [keplrWallet, cosmostationWallet, walletConnect],
  signerOptions: {
    signing: () => {
      return {
        signerOptions: defaultSignerOptions.Cosmos,
        broadcast: {
          checkTx: true,
        },
      };
    },
  },
  endpointOptions: {
    endpoints: {
      injective: {
        rpc: DefaultRpcEndpoint,
      },
    },
  },
};
getChainOptions().then((chainOptions) => {
  root.render(
    <WalletProvider {...chainOptions}>
      <ChainProvider {...interchainOptions}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </QueryClientProvider>
      </ChainProvider>
    </WalletProvider>,
  );
});
