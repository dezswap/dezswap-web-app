import { css, useTheme } from "@emotion/react";
import { Numeric } from "@xpla/xpla.js";
import { useMemo } from "react";
import { formatPercentage } from "utils";

interface ChangeRateFormatterProps {
  rate?: Numeric.Input;
  hasBrackets?: boolean;
}

function ChangeRateFormatter({
  rate,
  hasBrackets = true,
}: ChangeRateFormatterProps) {
  const theme = useTheme();
  const numericRate = Numeric.parse(rate || 0);
  const isPositive = numericRate.greaterThanOrEqualTo(0);

  const arrow = useMemo(() => {
    if (!rate) {
      return null;
    }
    if (isPositive) {
      return "↑";
    }
    return "↓";
  }, [isPositive, rate]);

  return rate !== undefined ? (
    <span
      css={css`
        color: ${isPositive ? theme.colors.positive : theme.colors.negative};
      `}
    >
      {hasBrackets && "("}
      {arrow}
      {formatPercentage(numericRate.abs())}
      {hasBrackets && ")"}
    </span>
  ) : null;
}

export default ChangeRateFormatter;
