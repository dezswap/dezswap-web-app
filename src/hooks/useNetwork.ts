import { useQuery } from "@tanstack/react-query";

import { getChain, getRpcEndpoint } from "~/constants/dezswap";
import { useChainName } from "~/stores/chainName";

import { NetworkInfo } from "~/types/common";

export const useNetwork = () => {
  const chainName = useChainName();

  const chainData = getChain(chainName);
  const selectedChain = chainData[0];

  const { data: rpcUrl } = useQuery({
    queryKey: ["rpcEndpoint", chainName],
    queryFn: () => getRpcEndpoint(chainName),
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
