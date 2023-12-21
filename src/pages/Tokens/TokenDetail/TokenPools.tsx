import DashboardPoolTable from "components/DashboardPoolTable";
import useDashboardPools from "./useDashboardPools";

function TokenPools({ tokenAddress }: { tokenAddress: string }) {
  const pools = useDashboardPools(tokenAddress);
  return pools ? <DashboardPoolTable title="Pools" data={pools} /> : null;
}

export default TokenPools;
