import { WCCosmosWallet, WCWallet } from "@interchain-kit/core";
import { cosmostationWallet } from "@interchain-kit/cosmostation-extension";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { ChainProvider } from "@interchain-kit/react";
import { DEFAULT_COSMOS_SIGNER_CONFIG } from "@interchainjs/cosmos";
import { DEFAULT_COSMOS_EVM_SIGNER_CONFIG } from "@xpla/xpla";
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
walletConnect.setNetworkWallet("cosmos", new WCCosmosWallet());
const wallets = [keplrWallet, cosmostationWallet, walletConnect];

export function InterchainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const chainName = useChainName();

  const interchainOptions = useMemo(
    () =>
      ({
        chains: getChain(chainName),
        assetLists: getAssetList(chainName),
        wallets,
        signerOptions: {
          signing: (chain) => ({
            cosmosSignerConfig: (
              typeof chain === "string"
                ? chain.includes("xpla")
                : chain.chainName.includes("xpla")
            )
              ? DEFAULT_COSMOS_EVM_SIGNER_CONFIG
              : DEFAULT_COSMOS_SIGNER_CONFIG,
          }),
        },
      }) satisfies Partial<Parameters<typeof ChainProvider>[0]>,
    [chainName],
  );

  return (
    // ChainProvider is not reactive to props change, so remount is needed when chainName changes
    <ChainProvider {...interchainOptions} key={chainName}>
      {children}
    </ChainProvider>
  );
}
