import { useQuery } from "@tanstack/react-query";

import DashboardTransactionTable from "~/components/DashboardTransactionTable";

import useDashboard from "~/hooks/dashboard/useDashboard";
import useAPI from "~/hooks/useAPI";
import useNetwork from "~/hooks/useNetwork";

function Transactions({ whiteList }: { whiteList?: string[] }) {
  const {
    selectedChain: { chainId },
  } = useNetwork();
  const api = useAPI();
  const { transactions } = useDashboard();

  const { data: filteredTx = [] } = useQuery({
    queryKey: ["dashboard", "transactions", whiteList, chainId],
    queryFn: () =>
      api.dashboard.getTransactions({ token: whiteList?.join(",") }),
    enabled: whiteList !== undefined,
  });

  return transactions ? (
    <DashboardTransactionTable data={whiteList ? filteredTx : transactions} />
  ) : null;
}

export default Transactions;
