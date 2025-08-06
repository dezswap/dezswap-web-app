import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";
import useNetwork from "./useNetwork";

function useNativeTokens() {
  const api = useAPI();

  const { chainName, selectedChain } = useNetwork();
  const { data: nativeTokens, isLoading: isNativeTokensLoading } = useQuery({
    queryKey: ["nativeTokens", chainName],
    queryFn: () => {
      console.log("chainName", selectedChain);
      return api.getNativeToken();
    },
    enabled: !!chainName && !api.isLoading,
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    initialData: [],
  });

  return { nativeTokens, isNativeTokensLoading };
}

export default useNativeTokens;
