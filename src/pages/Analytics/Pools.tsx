import DashboardPoolTable from "~/components/DashboardPoolTable";

import useDashboard from "~/hooks/dashboard/useDashboard";

function Pools() {
  const { pools } = useDashboard();

  return <DashboardPoolTable data={pools || []} />;
}

export default Pools;
