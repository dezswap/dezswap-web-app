import { useCallback, useMemo } from "react";
import { useConnectedWallet } from "@xpla/wallet-provider";
import useAPI from "hooks/useAPI";
import { getIbcTokenHash, isNativeTokenAddress } from "utils";
import useNetwork from "hooks/useNetwork";
import { useQuery } from "@tanstack/react-query";
import useVerifiedAssets from "./useVerifiedAssets";

const UPDATE_INTERVAL = 30000;

const useBalance = (address?: string) => {
  const connectedWallet = useConnectedWallet();
  const { verifiedIbcAssets } = useVerifiedAssets();
  const network = useNetwork();
  const api = useAPI();

  const fetchBalance = useCallback(async () => {
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
  }, [api, address, connectedWallet, verifiedIbcAssets]);

  const { data: balance } = useQuery({
    queryKey: ["balance", address, network.name],
    queryFn: fetchBalance,
    refetchInterval: UPDATE_INTERVAL,
    refetchIntervalInBackground: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    cacheTime: UPDATE_INTERVAL,
    enabled: !!address,
  });

  return useMemo(() => balance, [balance]);
};

export default useBalance;
