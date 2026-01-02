import { ThemeProvider } from "@emotion/react";
import { WCCosmosWallet, WCWallet } from "@interchain-kit/core";
import { cosmostationWallet } from "@interchain-kit/cosmostation-extension";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { ChainProvider } from "@interchain-kit/react";
import { createCosmosQueryClient } from "@interchainjs/cosmos";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider, getChainOptions } from "@xpla/wallet-provider";
import { DEFAULT_COSMOS_EVM_SIGNER_CONFIG } from "@xpla/xpla";
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
const cosmosQueryClient = await createCosmosQueryClient(
  "https://cube-rpc.xpla.io",
);

const defaultOption = {
  projectId: import.meta.env.VITE_PROJECT_ID,
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
walletConnect.setNetworkWallet("cosmos", new WCCosmosWallet());

const root = ReactDOM.createRoot(document.getElementById("root")!);

const interchainOptions = {
  chains: DefaultChain,
  assetLists: DefaultAssetList,
  wallets: [keplrWallet, cosmostationWallet, walletConnect],
  signerOptions: {
    signing: () => ({
      cosmosSignerConfig: {
        ...DEFAULT_COSMOS_EVM_SIGNER_CONFIG,
        queryClient: cosmosQueryClient,
      },
    }),
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
