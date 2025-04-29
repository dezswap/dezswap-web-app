import { Link as RRLink, LinkProps } from "react-router-dom";
import { useFormatTo } from "hooks/useFormatTo";
import React from "react";

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, ...props }, ref) => {
    const { formatTo } = useFormatTo();
    const formattedTo = formatTo({ to });

    return <RRLink to={formattedTo} {...props} ref={ref} />;
  },
);

export default Link;
