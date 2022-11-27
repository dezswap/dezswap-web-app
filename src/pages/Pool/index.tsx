import Typography from "components/Typography";
import { Outlet } from "react-router-dom";

function PoolPage() {
  return (
    <>
      <Typography>Pool</Typography>
      <Outlet />
    </>
  );
}

export default PoolPage;
