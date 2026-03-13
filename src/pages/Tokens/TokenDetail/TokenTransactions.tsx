import { useGetDashboardTxs } from "~/api/dezswap";

import DashboardTransactionTable from "~/components/DashboardTransactionTable";

function TokenTransactions({ tokenAddress }: { tokenAddress: string }) {
  const { data: transactions } = useGetDashboardTxs({ token: tokenAddress });
  return <DashboardTransactionTable data={transactions || []} />;
}

export default TokenTransactions;
