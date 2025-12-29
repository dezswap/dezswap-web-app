import { Numeric } from "@xpla/xpla.js";
import { useEffect, useMemo, useState } from "react";

import { XPLA_ADDRESS } from "~/constants/network";

import { amountToValue, valueToAmount } from "~/utils";

import useBalance from "./useBalance";

const useBalanceMinusFee = (address?: string, feeAmount?: string) => {
  const balance = useBalance(address);
  const [balanceMinusFee, setBalanceMinusFee] = useState(balance);

  useEffect(() => {
    if (balance) {
      if (address === XPLA_ADDRESS && feeAmount !== undefined) {
        const res = Numeric.parse(amountToValue(balance) || 0).minus(
          amountToValue(feeAmount) || 0,
        );
        setBalanceMinusFee(res.gt(0) ? valueToAmount(res) || "0" : "0");
      } else {
        setBalanceMinusFee(balance);
      }
    } else {
      setBalanceMinusFee("0");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, feeAmount]);

  return useMemo(() => {
    return balanceMinusFee;
  }, [balanceMinusFee]);
};

export default useBalanceMinusFee;
