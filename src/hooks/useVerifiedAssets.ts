import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";
import useNetwork from "./useNetwork";

const useVerifiedAssets = () => {
  const api = useAPI();
  const network = useNetwork();
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
    verifiedAssets: verifiedAssets?.[network.name],
    verifiedIbcAssets: verifiedIbcAssets?.[network.name],
  };
};

export default useVerifiedAssets;
