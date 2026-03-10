import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import useAPI from "./useAPI";
import { useConnectedWallet } from "./useConnectedWallet";
import useNetwork from "./useNetwork";

function useAuthSequence() {
  const api = useAPI();
  const connectedWallet = useConnectedWallet();
  const walletAddress = connectedWallet?.walletAddress;
  const { chainName } = useNetwork();
  const isXpla = useMemo(() => chainName.includes("xpla"), [chainName]);

  const { data: sequence, isLoading } = useQuery({
    queryKey: ["authSequence", walletAddress, chainName, isXpla],
    queryFn: async (): Promise<bigint> => {
      if (!walletAddress || !chainName) {
        throw new Error("Wallet address or chain name is not available");
      }

      try {
        const authInfo = await api.getAuthInfo();
        const { sequence: authSequence } = authInfo || {};
        return authSequence ?? 0n;
      } catch (err) {
        console.error("Failed to get auth sequence:", err);
        throw err;
      }
    },
    enabled: !api.isLoading && !!walletAddress && !!chainName,
    retry: 3,
    staleTime: 0,
  });

  return {
    sequence: sequence ?? 0n,
    isLoading,
  };
}

export default useAuthSequence;
