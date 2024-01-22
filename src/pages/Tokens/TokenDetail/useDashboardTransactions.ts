import { useQuery } from "@tanstack/react-query";
import useAPI from "hooks/useAPI";
import useNetwork from "hooks/useNetwork";

const useDashboardTransactions = (tokenAddress: string) => {
  const network = useNetwork();
  const api = useAPI();
  const { data } = useQuery({
    queryKey: ["transactions", tokenAddress, network.chainID],
    queryFn: () => api.dashboard.getTransactions({ token: tokenAddress }),
  });

  return data;
};

export default useDashboardTransactions;
