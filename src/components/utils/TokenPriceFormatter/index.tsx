import { css } from "@emotion/react";
import { Numeric } from "@xpla/xpla.js";

import { formatTokenPrice } from "~/utils";

import OverflowTooltip from "../OverflowTooltip";

interface TokenPriceFormatterProps {
  value?: Parameters<typeof formatTokenPrice>[0];
}

function TokenPriceFormatter({ value = 0 }: TokenPriceFormatterProps) {
  const parsedValue = Numeric.parse(value);
  const formattedValue = formatTokenPrice(value);
  const isTruncated = formattedValue?.startsWith("< ");
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
      disabled={isTruncated ? false : undefined}
    >
      {formattedValue}
    </OverflowTooltip>
  );
}

export default TokenPriceFormatter;
