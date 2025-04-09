import { Link as RRLink, LinkProps } from "react-router-dom";
import { useFormatTo } from "hooks/useFormatTo";

function Link({ to, ...props }: LinkProps) {
  const { formatTo } = useFormatTo();
  const formattedTo = formatTo({ to });

  return <RRLink to={formattedTo} {...props} />;
}

export default Link;
