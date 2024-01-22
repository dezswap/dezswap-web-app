import DashboardTransactionTable from "components/DashboardTransactionTable";
import useDashboard from "hooks/dashboard/useDashboard";

function Transactions() {
  const { transactions } = useDashboard();

  return transactions ? (
    <DashboardTransactionTable data={transactions} />
  ) : null;
}

export default Transactions;
