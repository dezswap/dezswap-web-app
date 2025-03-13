import { useQuery } from "@tanstack/react-query";
import useNetwork from "./useNetwork";
import useAPI from "./useAPI";

const usePools = () => {
  const {
    selectedChain: { chainName },
  } = useNetwork();
  const api = useAPI();
  const { data: pools } = useQuery(["pools", chainName], async () => {
    const res = await api.getPools();
    return res;
  });

  return { pools };
};

export default usePools;
