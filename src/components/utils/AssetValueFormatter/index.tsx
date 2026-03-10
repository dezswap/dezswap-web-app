import { css } from "@emotion/react";
import { Numeric } from "@xpla/xpla.js";
import Decimal from "decimal.js";

import { Token } from "~/types/api";

import { amountToValue, formatDecimals, formatNumber } from "~/utils";

import OverflowTooltip from "../OverflowTooltip";

interface AssetValueFormatterProps {
  asset?: Partial<Pick<Token, "decimals" | "symbol">>;
  amount?: Decimal.Value;
  showSymbol?: boolean;
}

function AssetValueFormatter({
  asset,
  amount,
  showSymbol = true,
}: AssetValueFormatterProps) {
  const parsedValue = Numeric.parse(
    amountToValue(amount, asset?.decimals) || "0",
  );
  const formattedValue = formatNumber(formatDecimals(parsedValue, 3));
  const valueToDisplay =
    parsedValue.lt(0.001) && !parsedValue.eq(0) ? "< 0.001" : formattedValue;
  return (
    <OverflowTooltip
      content={
        <div
          css={css`
            word-break: break-all;
          `}
        >
          {parsedValue.toFixed()}
          {showSymbol && ` ${asset?.symbol || ""}`}
        </div>
      }
      disabled={valueToDisplay !== formattedValue ? false : undefined}
    >
      {`${valueToDisplay}${showSymbol ? ` ${asset?.symbol || ""}` : ""}`}
    </OverflowTooltip>
  );
}

export default AssetValueFormatter;
