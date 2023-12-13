import DashboardPoolTable from "components/DashboardPoolTable";
import useDashboard from "hooks/useDashboard";

function Pools() {
  const { pools } = useDashboard();

  return pools ? <DashboardPoolTable data={pools} /> : null;
}

export default Pools;
