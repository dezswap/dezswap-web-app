import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";
import useNetwork from "./useNetwork";
import useSigningClient from "./useSigningClient";
import useConnectedWallet from "./useConnectedWallet";
import { useMemo } from "react";

function useAuthSequence() {
  const api = useAPI();
  const { signingClient: client } = useSigningClient();
  const { walletAddress } = useConnectedWallet();
  const { chainName } = useNetwork();
  const isXpla = useMemo(() => chainName.includes("xpla"), [chainName]);

  const { data: sequence, isLoading } = useQuery({
    queryKey: ["authSequence", walletAddress, chainName, isXpla, !!client],
    queryFn: async (): Promise<bigint> => {
      if (!walletAddress || !chainName) {
        throw new Error("Wallet address or chain name is not available");
      }

      try {
        if (isXpla) {
          const authInfo = await api.getAuthInfo();
          const { sequence: authSequence } = authInfo || {};
          return authSequence ?? 0n;
        }
        if (!client) {
          throw new Error("Signing client is not available");
        }
        const clientSequence = await client.getSequence(walletAddress);
        return clientSequence ?? 0n;
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
