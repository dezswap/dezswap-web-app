import { ThemeProvider } from "@emotion/react";
import { ChainProvider } from "@interchain-kit/react";
import { cosmostationWallet } from "@interchain-kit/cosmostation-extension";
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
import { WCWallet } from "@interchain-kit/core";
import { createCosmosQueryClient } from "@interchainjs/cosmos";
import { DEFAULT_COSMOS_EVM_SIGNER_CONFIG } from "@xpla/xpla";

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
const baseSignerConfig = {
  queryClient: await createCosmosQueryClient("https://cube-rpc.xpla.io"),
  chainId: "cube_47-5",
  addressPrefix: "xpla",
};
const signerOptions = {
  ...DEFAULT_COSMOS_EVM_SIGNER_CONFIG,
  ...baseSignerConfig,
};

const interchainOptions = {
  chains: DefaultChain,
  assetLists: DefaultAssetList,
  wallets: [keplrWallet, cosmostationWallet, walletConnect],
  signerOptions: {
    signing: () => {
      return {
        cosmosSignerConfig: signerOptions,
        checkTx: true,
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
console.log("hello");
getChainOptions().then((chainOptions) => {
  console.log(chainOptions, interchainOptions);
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
