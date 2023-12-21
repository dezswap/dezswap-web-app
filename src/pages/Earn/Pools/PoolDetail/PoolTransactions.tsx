import DashboardTransactionTable from "components/DashboardTransactionTable";
import usePoolData from "./usePoolData";

function PoolTransactions({ poolAddress }: { poolAddress: string }) {
  const data = usePoolData(poolAddress);
  return <DashboardTransactionTable data={data?.txs || []} />;
}

export default PoolTransactions;
