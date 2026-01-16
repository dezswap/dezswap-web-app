import { css } from "@emotion/react";
import { Numeric } from "@xpla/xpla.js";
import Decimal from "decimal.js";

import { formatPercentage } from "~/utils";

import OverflowTooltip from "../OverflowTooltip";

interface PercentageFormatterProps {
  value: Decimal.Value;
}

function PercentageFormatter({ value }: PercentageFormatterProps) {
  const parsedValue = Numeric.parse(value);
  const formattedValue = formatPercentage(value);
  const valueToDisplay =
    !parsedValue.eq(0) && parsedValue.lt(0.01) ? "<0.01%" : formattedValue;

  return (
    <OverflowTooltip
      content={
        <div
          css={css`
            word-break: break-all;
          `}
        >
          {parsedValue.toFixed()}%
        </div>
      }
      disabled={valueToDisplay !== formattedValue ? false : undefined}
    >
      {valueToDisplay}
    </OverflowTooltip>
  );
}

export default PercentageFormatter;
