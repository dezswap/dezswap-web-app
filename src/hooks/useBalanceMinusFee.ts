import { useEffect, useMemo, useState } from "react";
import { Numeric } from "@xpla/xpla.js";
import { amountToValue, valueToAmount } from "utils";
import useBalance from "./useBalance";
import useNetwork from "./useNetwork";

const useBalanceMinusFee = (address?: string, feeAmount?: string) => {
  const balance = useBalance(address);
  const [balanceMinusFee, setBalanceMinusFee] = useState(balance);
  const { selectedChain } = useNetwork();

  useEffect(() => {
    if (balance) {
      if (
        address === selectedChain.fees.feeTokens[0].denom &&
        feeAmount !== undefined
      ) {
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
  }, [balance, feeAmount, selectedChain.fees.feeTokens[0].denom]);

  return useMemo(() => {
    return balanceMinusFee;
  }, [balanceMinusFee]);
};

export default useBalanceMinusFee;
