import { useEffect, useMemo, useState } from "react";
import { Numeric } from "@xpla/xpla.js";
import { XPLA_ADDRESS } from "constants/network";

const useBalanceMinusFee = (
  address?: string,
  balance?: string,
  feeAmount?: string,
) => {
  const [balanceMinusFee, setAsset1BalanceMinusFee] = useState(balance);

  useEffect(() => {
    if (balance) {
      if (address === XPLA_ADDRESS && feeAmount !== undefined) {
        const res = Numeric.parse(balance).minus(feeAmount);
        setAsset1BalanceMinusFee(res.gt(0) ? res.toString() : "0");
      } else {
        setAsset1BalanceMinusFee(Numeric.parse(balance).toString());
      }
    } else {
      setAsset1BalanceMinusFee("0");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, feeAmount]);

  return useMemo(() => {
    return balanceMinusFee;
  }, [balanceMinusFee]);
};

export default useBalanceMinusFee;
