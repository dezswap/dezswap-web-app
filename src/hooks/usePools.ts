import { useQuery } from "@tanstack/react-query";
import useNetwork from "./useNetwork";
import useAPI from "./useAPI";

const usePools = () => {
  const network = useNetwork();
  const api = useAPI();
  const { data: pools } = useQuery(["pools", network.name], async () => {
    const res = await api.getPools();
    return res;
  });

  return { pools };
};

export default usePools;
