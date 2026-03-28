import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import {
  useClientsLoading,
  useCosmWasmClient,
} from "~/components/Providers/ClientProvider";
import { contractAddresses } from "~/constants/dezswap";
import { hasChainPrefix } from "~/utils/dezswap";

import { useNetwork } from "./useNetwork";

const useFetchDecimal = () => {
  const client = useCosmWasmClient();
  const isClientsLoading = useClientsLoading();
  const queryClient = useQueryClient();
  const { chainName } = useNetwork();

  const fetchDecimal = useCallback(
    async (tokenAddress: string) => {
      return queryClient.fetchQuery({
        queryKey: ["decimal", tokenAddress, isClientsLoading],
        queryFn: async () => {
          const contractAddress = contractAddresses[chainName]?.factory;
          if (!tokenAddress || !client || !contractAddress) {
            return undefined;
          }

          const isNativeTokenAddress = hasChainPrefix(tokenAddress);
          const queryMsg = isNativeTokenAddress
            ? { token_info: {} }
            : { native_token_decimals: { denom: tokenAddress } };

          const targetAddress = isNativeTokenAddress
            ? tokenAddress
            : contractAddress;

          try {
            const parsed = (await client.queryContractSmart(
              targetAddress,
              queryMsg,
            )) as { decimals: number };
            return isNativeTokenAddress
              ? { a: parsed.decimals }
              : parsed.decimals;
          } catch (e) {
            console.log(e);
            return undefined;
          }
        },
        staleTime: Infinity,
        gcTime: Infinity,
      });
    },
    [client, isClientsLoading, queryClient, chainName],
  );

  return useMemo(
    () => ({
      fetchDecimal,
    }),
    [fetchDecimal],
  );
};

export default useFetchDecimal;
