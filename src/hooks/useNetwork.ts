import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { CHAIN_NAME_SEARCH_PARAM } from "~/constants/dezswap";

import { NetworkInfo } from "~/types/common";

import { useChain } from "./useChain";

const useNetwork = () => {
  const [searchParams] = useSearchParams();
  const paramName = searchParams.get(CHAIN_NAME_SEARCH_PARAM);

  const {
    getRpcEndpoint,
    chain: selectedChain,
    chainName,
  } = useChain(paramName);

  const { data: rpcUrl } = useQuery({
    queryKey: ["useNetwork", getRpcEndpoint, chainName],
    queryFn: async () => {
      return getRpcEndpoint();
    },
  });

  return useMemo(
    () =>
      ({
        chainName,
        selectedChain,
        rpcUrl,
      }) satisfies NetworkInfo,
    [chainName, rpcUrl, selectedChain],
  );
};

export default useNetwork;
