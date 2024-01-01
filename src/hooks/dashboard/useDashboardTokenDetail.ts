import { useQuery } from "@tanstack/react-query";
import useAPI from "hooks/useAPI";
import useNetwork from "hooks/useNetwork";

const useDashboardTokenDetail = (tokenAddress: string) => {
  const network = useNetwork();
  const api = useAPI();

  const { data } = useQuery({
    queryKey: ["dashboard", "token", tokenAddress, network.chainID],
    queryFn: () => api.dashboard.getTokenDetail(tokenAddress),
  });

  return data;
};

export default useDashboardTokenDetail;
