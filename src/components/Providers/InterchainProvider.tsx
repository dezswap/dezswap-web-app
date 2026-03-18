import { WCWallet } from "@interchain-kit/core";
import { cosmostationWallet } from "@interchain-kit/cosmostation-extension";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { ChainProvider } from "@interchain-kit/react";
import { defaultSignerOptions } from "@interchainjs/cosmos/defaults";
import { defaultSignerOptions as xplaSignerOptions } from "@xpla/xpla/defaults";
import { useMemo } from "react";

import { getAssetList, getChain } from "~/constants/dezswap";

import { useChainName } from "~/stores/chainName";

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

const wallets = [keplrWallet, cosmostationWallet, walletConnect];

export function InterchainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const chainName = useChainName();

  const interchainOptions = useMemo(
    () => ({
      chains: getChain(chainName),
      assetLists: getAssetList(chainName),
      wallets,
      signerOptions: {
        signing: () => ({
          signerOptions: chainName.includes("xpla")
            ? xplaSignerOptions.Cosmos
            : defaultSignerOptions,
          broadcast: {
            checkTx: true,
          },
        }),
      },
    }),
    [chainName],
  );

  return (
    // ChainProvider is not reactive to props change, so remount is needed when chainName changes
    <ChainProvider {...interchainOptions} key={chainName}>
      {children}
    </ChainProvider>
  );
}
