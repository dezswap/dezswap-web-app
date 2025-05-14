import { ThemeProvider } from "@emotion/react";
import { ChainProvider } from "@interchain-kit/react";
import { cosmostationWallet } from "@interchain-kit/cosmostation-extension";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { getChainOptions, WalletProvider } from "@xpla/wallet-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defaultSignerOptions } from "@xpla/xpla/defaults";
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
import { keplrMobile } from "@interchain-kit/keplr-mobile";
import { OS, WCWallet } from "@interchain-kit/core";

window.ResizeObserver = ResizeObserver;

const queryClient = new QueryClient();
// const keplrMobile = new KeplrMobile(undefined, {
//   projectId: "bb7c346a9734b19a12c5d5828fa48eb8",
//   name: "keplr-mobile",
//   prettyName: "Keplr Mobile",
//   logo: "ICON",
//   mode: "wallet-connect",
//   downloads: [
//     {
//       device: "mobile",
//       os: "android",
//       link: "https://play.google.com/store/apps/details?id=com.chainapsis.keplr&hl=en&gl=US&pli=1",
//     },
//     {
//       device: "mobile",
//       os: "ios",
//       link: "https://apps.apple.com/us/app/keplr-wallet/id1567851089",
//     },
//     {
//       link: "https://www.keplr.app/download",
//     },
//   ],
//   walletconnect: {
//     name: "Keplr",
//     projectId: "bb7c346a9734b19a12c5d5828fa48eb8",
//     encoding: "base64",
//     requiredNamespaces: {
//       methods: [
//         "keplr_getKey",
//         "keplr_signAmino",
//         "keplr_signDirect",
//         "keplr_signArbitrary",
//         "keplr_enable",
//         "keplr_signEthereum",
//       ],
//       events: ["keplr_accountsChanged"],
//     },
//     mobile: {
//       native: {
//         ios: "keplrwallet:",
//         android: "intent:",
//       },
//     },
//     formatNativeUrl: (
//       appUrl: string,
//       wcUri: string,
//       os: OS | undefined,
//       _name: string,
//     ): string => {
//       const plainAppUrl = appUrl.split(":")[0];
//       const encodedWcUrl = encodeURIComponent(wcUri);
//       switch (os) {
//         case "ios":
//           return `${plainAppUrl}://wcV2?${encodedWcUrl}`;
//         case "android":
//           return `intent://wcV2?${encodedWcUrl}#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;`;
//         default:
//           return `${plainAppUrl}://wcV2?${encodedWcUrl}`;
//       }
//     },
//   },
// });
const walletConnect = new WCWallet(undefined, {
  metadata: {
    name: "Wallet Connect In React Example",
    description: "test",
    url: "https://localhost:5173/",
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
});
const root = ReactDOM.createRoot(document.getElementById("root")!);
const interchainOptions = {
  chains: DefaultChain,
  assetLists: DefaultAssetList,
  wallets: [keplrWallet, cosmostationWallet, keplrMobile, walletConnect],
  walletConnectOptions: {
    signClient: {
      projectId: "bb7c346a9734b19a12c5d5828fa48eb8",
      relayUrl: "https://localhost:5173/",
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
