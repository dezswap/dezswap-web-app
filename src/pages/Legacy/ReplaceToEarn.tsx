import { useLocation } from "react-router-dom";

import Redirect from "~/components/Redirect";

// For legacy links
export function ReplaceToEarn() {
  const location = useLocation();

  return (
    <Redirect to={`/earn${location.pathname}`.replace("/pool", "/pools")} />
  );
}
