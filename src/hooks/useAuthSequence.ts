import { useQuery } from "@tanstack/react-query";

import useAPI from "./useAPI";
import { useConnectedWallet } from "./useConnectedWallet";
import { useNetwork } from "./useNetwork";

function useAuthSequence() {
  const api = useAPI();
  const { walletAddress } = useConnectedWallet() ?? {};
  const { chainName } = useNetwork();

  return useQuery({
    queryKey: ["authSequence", walletAddress, chainName],
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
}

export default useAuthSequence;
