import DashboardPoolTable from "~/components/DashboardPoolTable";

import useDashboardPools from "./useDashboardPools";

function TokenPools({ tokenAddress }: { tokenAddress: string }) {
  const pools = useDashboardPools(tokenAddress);
  return <DashboardPoolTable title="Pools" data={pools || []} />;
}

export default TokenPools;
