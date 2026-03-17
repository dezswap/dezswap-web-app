import { useChain } from "@interchain-kit/react";
import { useQuery } from "@tanstack/react-query";

import { useChainName } from "~/stores/chainName";

import { NetworkInfo } from "~/types/common";

export const useNetwork = () => {
  const chainName = useChainName();

  const { getRpcEndpoint, chain: selectedChain } = useChain(chainName);

  const { data: rpcUrl } = useQuery({
    queryKey: ["rpcEndpoint", chainName],
    queryFn: () => getRpcEndpoint(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialData: selectedChain?.apis?.rpc?.[0]?.address ?? "",
  });

  return {
    chainName,
    selectedChain,
    rpcUrl,
  } satisfies NetworkInfo;
};
