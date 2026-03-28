import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useNetwork } from "./useNetwork";
import type { VerifiedAssets, VerifiedIbcAssets } from "~/types/token";

const useVerifiedAssets = () => {
  const { chainName } = useNetwork();
  const xplaNetworkName = useMemo(
    () => (chainName === "xpla" ? "mainnet" : "testnet"),
    [chainName],
  );
  const { data: verifiedAssets } = useQuery({
    queryKey: ["verifiedAssets"],
    queryFn: async () => {
      const { data } = await axios.get<VerifiedAssets>(
        "https://assets.xpla.io/cw20/tokens.json",
      );
      return data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnReconnect: true,
  });
  const { data: verifiedIbcAssets } = useQuery({
    queryKey: ["verifiedIbcAssets"],
    queryFn: async () => {
      const { data } = await axios.get<VerifiedIbcAssets>(
        "https://assets.xpla.io/ibc/tokens.json",
      );
      return data;
    },
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
