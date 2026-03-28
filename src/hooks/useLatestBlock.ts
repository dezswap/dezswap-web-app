import { useQuery } from "@tanstack/react-query";

import { useStargateClient } from "~/components/Providers/ClientProvider";

import { useNetwork } from "./useNetwork";

const UPDATE_INTERVAL = 3000;

export const useLatestBlock = () => {
  const client = useStargateClient();
  const { selectedChain: chainName } = useNetwork();

  const { data: height } = useQuery({
    queryKey: ["latestBlockHeight", chainName],
    queryFn: async () => {
      if (!client) return "0";
      const h = await client.getHeight();
      return String(h);
    },
    enabled: !!client,
    refetchInterval: UPDATE_INTERVAL,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  return height || "0";
};
