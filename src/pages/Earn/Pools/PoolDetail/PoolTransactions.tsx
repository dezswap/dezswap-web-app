import { useGetDashboardPoolsAddress } from "~/api/dezswap";

import DashboardTransactionTable from "~/components/DashboardTransactionTable";

function PoolTransactions({ poolAddress }: { poolAddress: string }) {
  const { data } = useGetDashboardPoolsAddress(poolAddress);
  return <DashboardTransactionTable data={data?.txs ?? []} />;
}

export default PoolTransactions;
