import { useGetDashboardPools } from "~/api/dezswap";

import DashboardPoolTable from "~/components/DashboardPoolTable";

function Pools() {
  const { data: pools } = useGetDashboardPools();

  return <DashboardPoolTable data={pools || []} />;
}

export default Pools;
