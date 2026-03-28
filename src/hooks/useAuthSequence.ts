import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  useClientsLoading,
  useStargateClient,
} from "~/components/Providers/ClientProvider";

import { useConnectedWallet } from "./useConnectedWallet";
import { useNetwork } from "./useNetwork";

function useAuthSequence() {
  const client = useStargateClient();
  const isClientsLoading = useClientsLoading();
  const { walletAddress } = useConnectedWallet() ?? {};
  const { chainName } = useNetwork();
  const isXpla = useMemo(() => chainName.includes("xpla"), [chainName]);

  const { data: sequence, isLoading } = useQuery({
    queryKey: ["authSequence", walletAddress, chainName, isXpla],
    queryFn: async (): Promise<bigint> => {
      if (!walletAddress || !chainName) {
        throw new Error("Wallet address or chain name is not available");
      }

      try {
        const account = await client!.getAccount(walletAddress);
        const { sequence: authSequence } = account || {};
        return authSequence != null ? BigInt(authSequence) : 0n;
      } catch (err) {
        console.error("Failed to get auth sequence:", err);
        throw err;
      }
    },
    enabled: !isClientsLoading && !!client && !!walletAddress && !!chainName,
    retry: 3,
    staleTime: 0,
  });

  return {
    sequence: sequence ?? 0n,
    isLoading,
  };
}

export default useAuthSequence;
