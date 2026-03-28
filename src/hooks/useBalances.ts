import { useQueries } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  useClientsLoading,
  useCosmWasmClient,
  useStargateClient,
} from "~/components/Providers/ClientProvider";
import { getIbcTokenHash } from "~/utils";

import { useConnectedWallet } from "./useConnectedWallet";
import { useNativeTokens } from "./useNativeTokens";
import { useNetwork } from "./useNetwork";
import useVerifiedAssets from "./useVerifiedAssets";

const UPDATE_INTERVAL = 30000;

const useBalances = (addresses: string[]) => {
  const { walletAddress } = useConnectedWallet() ?? {};
  const { verifiedIbcAssets } = useVerifiedAssets();
  const { chainName } = useNetwork();
  const { data: nativeTokens } = useNativeTokens();
  const cosmwasmClient = useCosmWasmClient();
  const stargateClient = useStargateClient();
  const isClientsLoading = useClientsLoading();

  const fetchBalance = useCallback(
    async (address: string) => {
      if (address && chainName && walletAddress) {
        if (
          nativeTokens?.some((n) => n.token === address) ||
          address.includes("ibc") ||
          (verifiedIbcAssets && !!verifiedIbcAssets?.[getIbcTokenHash(address)])
        ) {
          if (!stargateClient) return "0";
          const coin = await stargateClient.getBalance(walletAddress, address);
          return `${coin?.amount || 0}`;
        }
        if (!cosmwasmClient) return "0";
        const res = (await cosmwasmClient.queryContractSmart(address, {
          balance: { address: walletAddress },
        })) as { balance: string };
        return `${res.balance || 0}`;
      }
      return "0";
    },
    [chainName, walletAddress, verifiedIbcAssets, cosmwasmClient, stargateClient, nativeTokens],
  );

  const balanceQueryResults = useQueries({
    queries:
      addresses?.map((address) => ({
        queryKey: ["balance", walletAddress, address, chainName, isClientsLoading],
        queryFn: async () => {
          try {
            const balance = await fetchBalance(address);
            return { address, balance };
          } catch (error) {
            console.log(error);
          }
          return null;
        },
        enabled: !!address,
        refetchInterval: UPDATE_INTERVAL,
        refetchOnMount: false,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        cacheTime: UPDATE_INTERVAL,
      })) || [],
  });

  const prevDataString = useRef("");

  const [balances, setBalances] = useState<
    (
      | {
          address: string;
          balance: string;
        }
      | undefined
      | null
    )[]
  >([]);

  useEffect(() => {
    if (prevDataString.current !== JSON.stringify(balanceQueryResults)) {
      prevDataString.current = JSON.stringify(balanceQueryResults);
      setBalances(balanceQueryResults.map((result) => result.data));
    }
  }, [balanceQueryResults]);

  return useMemo(() => balances, [balances]);
};

export default useBalances;
