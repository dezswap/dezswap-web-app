import { useQueries } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConnectedWallet } from "@xpla/wallet-provider";
import { isNativeTokenAddress, getIbcTokenHash } from "utils";
import useAPI from "./useAPI";
import useNetwork from "./useNetwork";
import useVerifiedAssets from "./useVerifiedAssets";

const UPDATE_INTERVAL = 30000;

const useBalances = (addresses: string[]) => {
  const connectedWallet = useConnectedWallet();
  const { verifiedIbcAssets } = useVerifiedAssets();
  const network = useNetwork();

  const api = useAPI();
  const fetchBalance = useCallback(
    async (address: string) => {
      if (
        address &&
        connectedWallet?.network.name &&
        connectedWallet?.walletAddress
      ) {
        if (
          isNativeTokenAddress(connectedWallet?.network.name, address) ||
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
    [api, connectedWallet, verifiedIbcAssets],
  );

  const balanceQueryResults = useQueries({
    queries:
      addresses?.map((address) => ({
        queryKey: ["balance", address, network.name],
        queryFn: async () => {
          const balance = await fetchBalance(address);
          return { address, balance };
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
