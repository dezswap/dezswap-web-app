import { ThemeProvider } from "@emotion/react";
import { ChainProvider } from "@interchain-kit/react";
import { cosmostationWallet } from "@interchain-kit/cosmostation-extension";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { getChainOptions, WalletProvider } from "@xpla/wallet-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defaultSignerOptions as xplaSignerOptions } from "@xpla/xpla/defaults";
import App from "App";
import theme from "styles/theme";
import ResizeObserver from "resize-observer-polyfill";
import ReactDOM from "react-dom/client";
import "simplebar";
import "simplebar/dist/simplebar.css";
import "utils/overrideXplaNumeric";
import {
  CHAIN_NAME_SEARCH_PARAM,
  getAssetList,
  DefaultChainName,
  getChain,
} from "constants/dezswap";
import { WCWallet } from "@interchain-kit/core";
import { defaultSignerOptions } from "@interchainjs/cosmos/defaults";

window.ResizeObserver = ResizeObserver;

const params = new URLSearchParams(window.location.search);
const chainName = params.get(CHAIN_NAME_SEARCH_PARAM) ?? DefaultChainName;

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
  chains: getChain(chainName),
  assetLists: getAssetList(chainName),
  wallets: [keplrWallet, cosmostationWallet, walletConnect],
  signerOptions: {
    signing: () => {
      return {
        signerOptions: chainName.includes("xpla")
          ? xplaSignerOptions.Cosmos
          : defaultSignerOptions,
        broadcast: {
          checkTx: true,
        },
      };
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
