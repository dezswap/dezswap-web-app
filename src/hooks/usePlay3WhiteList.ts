import { useQuery } from "@tanstack/react-query";

import useAPI from "./useAPI";
import useNetwork from "./useNetwork";

const usePlay3WhiteList = () => {
  const api = useAPI();

  const { data: whiteList = [] } = useQuery({
    queryKey: ["play3WhiteList"],
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

export default usePlay3WhiteList;
