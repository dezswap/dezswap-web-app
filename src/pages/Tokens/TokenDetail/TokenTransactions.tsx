import DashboardTransactionTable from "components/DashboardTransactionTable";
import useDashboardTransactions from "./useDashboardTransactions";

function TokenTransactions({ tokenAddress }: { tokenAddress: string }) {
  const transactions = useDashboardTransactions(tokenAddress);
  return <DashboardTransactionTable data={transactions || []} />;
}

export default TokenTransactions;
