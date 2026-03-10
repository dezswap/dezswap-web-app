import { useQuery } from "@tanstack/react-query";

import useAPI from "./useAPI";
import useNetwork from "./useNetwork";

const usePools = () => {
  const { chainName } = useNetwork();
  const api = useAPI();
  const { data: pools } = useQuery({
    queryKey: ["pools", chainName],
    queryFn: async () => {
      const res = await api.getPools();
      return res;
    },
  });

  return { pools };
};

export default usePools;
