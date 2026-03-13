import { useQuery } from "@tanstack/react-query";

import { useGetDashboardTxs } from "~/api/dezswap";

import DashboardTransactionTable from "~/components/DashboardTransactionTable";

import useAPI from "~/hooks/useAPI";
import useNetwork from "~/hooks/useNetwork";

function Transactions({ whiteList }: { whiteList?: string[] }) {
  const {
    selectedChain: { chainId },
  } = useNetwork();
  const api = useAPI();
  const { data: transactions } = useGetDashboardTxs();

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
