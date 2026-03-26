import { useGetDashboardTxs } from "~/api/dezswap";

import DashboardTransactionTable from "~/components/DashboardTransactionTable";

function Transactions({ whiteList }: { whiteList?: string[] }) {
  const { data: transactions } = useGetDashboardTxs({
    token: whiteList?.join(","),
  });

  return transactions ? (
    <DashboardTransactionTable data={transactions} />
  ) : null;
}

export default Transactions;
