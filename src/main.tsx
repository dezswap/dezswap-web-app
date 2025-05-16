import { ThemeProvider } from "@emotion/react";
import { ChainProvider, InterchainWalletModal } from "@interchain-kit/react";
import { cosmostationWallet } from "@interchain-kit/cosmostation-extension";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { getChainOptions, WalletProvider } from "@xpla/wallet-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defaultSignerOptions } from "@xpla/xpla/defaults";
import { keplrMobile } from "@interchain-kit/keplr-mobile";
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
const interchainOptions = {
  chains: DefaultChain,
  assetLists: DefaultAssetList,
  wallets: [keplrWallet, cosmostationWallet, keplrMobile],
  walletModal: InterchainWalletModal,
  walletConnectOptions: {
    signClient: {
      projectId: "bb7c346a9734b19a12c5d5828fa48eb8",
      relayUrl: "wss://relay.walletconnect.com",
      metadata: {
        name: "Dezswap",
        description: "Dezswap",
        url: "https://localhost:5173/",
        icons: [],
      },
    },
  },
  signerOptions: {
    signing: () => {
      return {
        signerOptions: defaultSignerOptions.Cosmos,
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
        rpc: DefaultRpcEndpoint,
      },
    },
  },
};
getChainOptions().then((chainOptions) => {
  root.render(
    <WalletProvider {...chainOptions}>
      <ChainProvider {...interchainOptions}>
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
