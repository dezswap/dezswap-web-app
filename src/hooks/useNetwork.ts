import { useQuery } from "@tanstack/react-query";
import { CHAIN_NAME_SEARCH_PARAM, DefaultChainName } from "constants/dezswap";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { NetworkInfo } from "types/common";
import { useChain } from "./useChain";

const useNetwork = () => {
  const [searchParams] = useSearchParams();
  const paramName = searchParams.get(CHAIN_NAME_SEARCH_PARAM);

  const {
    getRpcEndpoint,
    chain: selectedChain,
    chainName,
  } = useChain(paramName ?? DefaultChainName);

  const { data: networkResult } = useQuery({
    queryKey: ["useNetwork", chainName],
    queryFn: async () => {
      try {
        const rpcUrl = await getRpcEndpoint();
        return { chainName, selectedChain, rpcUrl };
      } catch (error) {
        console.log(error);
      }
      return null;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const prevDataString = useRef("");

  const [network, setNetwork] = useState<NetworkInfo>({
    chainName,
    selectedChain,
    rpcUrl: selectedChain?.apis?.rpc?.[0]?.address,
  });

  useEffect(() => {
    if (
      prevDataString.current !== JSON.stringify(networkResult) &&
      networkResult
    ) {
      prevDataString.current = JSON.stringify(networkResult);
      setNetwork(networkResult);
    }
  }, [networkResult]);

  return network;
};

export default useNetwork;
