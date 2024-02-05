import Decimal from "decimal.js";
import { Token } from "types/api";
import { amountToValue, formatDecimals, formatNumber } from "utils";
import { Numeric } from "@xpla/xpla.js";
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
      content={`${formatNumber(parsedValue, {
        minimumSignificantDigits: 1,
      })}${showSymbol ? ` ${asset?.symbol || ""}` : ""}`}
      disabled={valueToDisplay !== formattedValue ? false : undefined}
    >
      {`${valueToDisplay}${showSymbol ? ` ${asset?.symbol || ""}` : ""}`}
    </OverflowTooltip>
  );
}

export default AssetValueFormatter;
