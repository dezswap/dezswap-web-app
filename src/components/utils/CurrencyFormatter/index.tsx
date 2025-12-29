import { css } from "@emotion/react";
import { Numeric } from "@xpla/xpla.js";

import { formatCurrency } from "~/utils";

import OverflowTooltip from "../OverflowTooltip";

interface CurrencyFormatterProps {
  value?: Parameters<typeof formatCurrency>[0];
}

function CurrencyFormatter({ value = 0 }: CurrencyFormatterProps) {
  const parsedValue = Numeric.parse(value);
  const formattedValue = formatCurrency(value);
  const isDecimalTooLong = (formattedValue?.split(".")[1]?.length || 0) > 2;
  const valueToDisplay =
    isDecimalTooLong && parsedValue.lt(0.01) ? "< $0.01" : formattedValue;
  return (
    <OverflowTooltip
      content={
        <div
          css={css`
            word-break: break-all;
          `}
        >
          ${parsedValue.toFixed()}
        </div>
      }
      disabled={valueToDisplay !== formattedValue ? false : undefined}
    >
      {valueToDisplay}
    </OverflowTooltip>
  );
}

export default CurrencyFormatter;
