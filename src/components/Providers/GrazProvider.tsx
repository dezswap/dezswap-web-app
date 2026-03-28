import { GrazProvider as BaseGrazProvider } from "graz";

import { SupportedChains } from "~/constants/dezswap";

/** Convert chain-registry Chain to graz-compatible chain info */
function toChainInfo(chain: (typeof SupportedChains)[number]) {
  const rpc = chain.apis?.rpc?.[0]?.address ?? "";
  const rest = chain.apis?.rest?.[0]?.address ?? "";
  const feeDenom = chain.fees?.feeTokens?.[0]?.denom ?? "axpla";
  const feeDenomUpper = feeDenom.replace(/^a/, "").toUpperCase();

  const currencies = [
    {
      coinDenom: feeDenomUpper,
      coinMinimalDenom: feeDenom,
      coinDecimals: 18,
    },
  ];

  return {
    chainId: chain.chainId ?? "",
    chainName: chain.chainName,
    rpc,
    rest,
    bip44: { coinType: chain.slip44 ?? 60 },
    bech32Config: {
      bech32PrefixAccAddr: chain.bech32Prefix ?? "xpla",
      bech32PrefixAccPub: `${chain.bech32Prefix ?? "xpla"}pub`,
      bech32PrefixValAddr: `${chain.bech32Prefix ?? "xpla"}valoper`,
      bech32PrefixValPub: `${chain.bech32Prefix ?? "xpla"}valoperpub`,
      bech32PrefixConsAddr: `${chain.bech32Prefix ?? "xpla"}valcons`,
      bech32PrefixConsPub: `${chain.bech32Prefix ?? "xpla"}valconspub`,
    },
    currencies,
    feeCurrencies: currencies,
    stakeCurrency: currencies[0],
  };
}

// Register ALL supported chains once at module level (no remount on chain switch)
const allChains = SupportedChains.map(toChainInfo);

// Build per-chain config with gas price for signing clients
const chainsConfig = Object.fromEntries(
  SupportedChains.map((chain) => {
    const feeToken = chain.fees?.feeTokens?.[0];
    return [
      chain.chainId ?? "",
      {
        gas: {
          price: String(feeToken?.averageGasPrice ?? 850000000000),
          denom: feeToken?.denom ?? "axpla",
        },
      },
    ];
  }),
);

export function GrazProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseGrazProvider
      grazOptions={{
        chains: allChains,
        chainsConfig,
        walletConnect: {
          options: {
            projectId: import.meta.env.VITE_PROJECT_ID,
          },
        },
      }}
    >
      {children}
    </BaseGrazProvider>
  );
}
