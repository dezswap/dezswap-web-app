import { useGetTokens } from "~/api/dezswap";

import { isNativeToken } from "~/utils";

import { useNetwork } from "./useNetwork";

export function useNativeTokens() {
  const { selectedChain } = useNetwork();

  return useGetTokens({
    query: {
      select: (tokens) =>
        tokens.filter(({ token }) =>
          isNativeToken(token, selectedChain.bech32Prefix ?? ""),
        ),
      enabled: !!selectedChain?.bech32Prefix,
      refetchOnReconnect: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  });
}
