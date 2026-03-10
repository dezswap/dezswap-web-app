import DashboardTransactionTable from "~/components/DashboardTransactionTable";

import useDashboardPoolDetail from "~/hooks/dashboard/useDashboardPoolDetail";

function PoolTransactions({ poolAddress }: { poolAddress: string }) {
  const data = useDashboardPoolDetail(poolAddress);
  return <DashboardTransactionTable data={data?.txs || []} />;
}

export default PoolTransactions;
