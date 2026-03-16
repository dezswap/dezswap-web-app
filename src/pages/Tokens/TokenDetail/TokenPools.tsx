import { useGetDashboardPools } from "~/api/dezswap";

import DashboardPoolTable from "~/components/DashboardPoolTable";

function TokenPools({ tokenAddress }: { tokenAddress: string }) {
  const { data: pools } = useGetDashboardPools({ token: tokenAddress });
  return <DashboardPoolTable title="Pools" data={pools || []} />;
}

export default TokenPools;
