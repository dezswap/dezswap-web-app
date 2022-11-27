import Typography from "components/Typography";
import { Outlet } from "react-router-dom";

function TradePage() {
  return (
    <>
      <Typography>Trade</Typography>
      <Outlet />
    </>
  );
}

export default TradePage;
