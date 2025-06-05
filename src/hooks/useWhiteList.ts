import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";

const useWhiteList = () => {
  const api = useAPI();

  const { data: whiteList = [] } = useQuery({
    queryKey: ["whiteList"],
    queryFn: async () => {
      const list = (await api.getPlay3List()) ?? [];
      return list.map((token) => token.cont_addr);
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnReconnect: true,
    enabled: !api.isLoading,
    retry: 3,
  });

  return whiteList;
};

export default useWhiteList;
