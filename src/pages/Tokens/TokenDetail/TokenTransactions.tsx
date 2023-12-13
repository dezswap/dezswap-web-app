import DashboardTransactionTable from "components/DashboardTransactionTable";
import useTransactions from "./useTransactions";

function TokenTransactions({ tokenAddress }: { tokenAddress: string }) {
  const transactions = useTransactions(tokenAddress);
  return <DashboardTransactionTable data={transactions || []} />;
}

export default TokenTransactions;
