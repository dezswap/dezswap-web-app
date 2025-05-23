import { useQueries } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isNativeTokenAddress, getIbcTokenHash } from "utils";
import useAPI from "./useAPI";
import useNetwork from "./useNetwork";
import useVerifiedAssets from "./useVerifiedAssets";
import useConnectedWallet from "./useConnectedWallet";

const UPDATE_INTERVAL = 30000;

const useBalances = (addresses: string[]) => {
  const { walletAddress } = useConnectedWallet();
  const { verifiedIbcAssets } = useVerifiedAssets();
  const { chainName } = useNetwork();
  const api = useAPI();

  const fetchBalance = useCallback(
    async (address: string) => {
      if (address && chainName && walletAddress) {
        if (
          isNativeTokenAddress(chainName, address) ||
          (verifiedIbcAssets && !!verifiedIbcAssets?.[getIbcTokenHash(address)])
        ) {
          const value = await api.getNativeTokenBalance(address);
          return `${value || 0}`;
        }
        const value = await api.getTokenBalance(address);
        return `${value || 0}`;
      }
      return "0";
    },
    [api, walletAddress, verifiedIbcAssets],
  );

  const balanceQueryResults = useQueries({
    queries:
      addresses?.map((address) => ({
        queryKey: ["balance", walletAddress, address, chainName, api.isLoading],
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
