import { useFormatTo } from "hooks/useFormatTo";
import { Navigate, type To } from "react-router-dom";

export interface RedirectProps {
  to: To;
}

function Redirect({ to }: RedirectProps) {
  const { formatTo } = useFormatTo();
  const formattedTo = formatTo({ to });

  return <Navigate to={formattedTo} replace />;
}
export default Redirect;
