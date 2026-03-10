import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import useAPI from "./useAPI";
import useNetwork from "./useNetwork";

const useVerifiedAssets = () => {
  const api = useAPI();
  const { chainName } = useNetwork();
  const xplaNetworkName = useMemo(
    () => (chainName === "xpla" ? "mainnet" : "testnet"),
    [chainName],
  );
  const { data: verifiedAssets } = useQuery({
    queryKey: ["verifiedAssets"],
    queryFn: api.getVerifiedTokenInfos,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnReconnect: true,
  });
  const { data: verifiedIbcAssets } = useQuery({
    queryKey: ["verifiedIbcAssets"],
    queryFn: api.getVerifiedIbcTokenInfos,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnReconnect: true,
  });

  return {
    verifiedAssets: verifiedAssets?.[xplaNetworkName],
    verifiedIbcAssets: verifiedIbcAssets?.[xplaNetworkName],
  };
};

export default useVerifiedAssets;
