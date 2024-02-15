import { formatCurrency } from "utils";
import { Numeric } from "@xpla/xpla.js";
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
      content={`$${parsedValue.toFixed()}`}
      disabled={valueToDisplay !== formattedValue ? false : undefined}
    >
      {valueToDisplay}
    </OverflowTooltip>
  );
}

export default CurrencyFormatter;
