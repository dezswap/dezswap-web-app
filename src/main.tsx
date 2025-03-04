import { ThemeProvider } from "@emotion/react";
import { getChainOptions, WalletProvider } from "@xpla/wallet-provider";
import App from "App";
import ReactDOM from "react-dom/client";
import theme from "styles/theme";
import { ChainProvider } from "@interchain-kit/react";
import { assetLists, chains } from "@chain-registry/v2";
import { keplrWallet } from "@interchain-kit/keplr-extension";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "simplebar";
import "simplebar/dist/simplebar.css";
import ResizeObserver from "resize-observer-polyfill";
import "utils/overrideXplaNumeric";

window.ResizeObserver = ResizeObserver;

const queryClient = new QueryClient();
export const defaultChainName = "xplatestnet";
export const defaultRpcEndpoint = "https://cube-rpc.xpla.io";

export const defaultChain = chains.find(
  (chain) => chain.chainName === defaultChainName,
);

export const defaultAssetList = assetLists.find(
  (assetList) => assetList.chainName === defaultChainName,
);
const root = ReactDOM.createRoot(document.getElementById("root")!);
getChainOptions().then((chainOptions) => {
  root.render(
    <WalletProvider {...chainOptions}>
      <ChainProvider
        // @ts-ignore
        chains={[defaultChain!]}
        // @ts-ignore
        assetLists={[defaultAssetList!]}
        wallets={[keplrWallet]}
        signerOptions={{
          signing: () => {
            return {
              broadcast: {
                checkTx: true,
                deliverTx: true,
              },
            };
          },
        }}
        endpointOptions={{
          endpoints: {
            injective: {
              rpc: [defaultRpcEndpoint],
            },
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </QueryClientProvider>
      </ChainProvider>
    </WalletProvider>,
  );
});
