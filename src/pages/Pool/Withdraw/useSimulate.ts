import { Numeric } from "@xpla/xpla.js";
import { useEffect, useMemo, useState } from "react";
import usePool from "hooks/usePool";
import { useNetwork } from "hooks/useNetwork";

export interface WithdrawSimulationResult {
  estimatedAmount: { address: string; amount: string }[];
  percentageOfShare: string;
}

const useSimulate = (
  pairAddress: string,
  liquidityTokenAddress: string,
  amount: string,
) => {
  const { name: networkName } = useNetwork();
  const pool = usePool(pairAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [result, setResult] = useState<WithdrawSimulationResult>();

  useEffect(() => {
    setIsLoading(true);
    setIsFailed(false);
    let isAborted = false;

    const fetchPool = async () => {
      try {
        if (isAborted) {
          return;
        }

        if (pool) {
          const poolAssets = pool.assets.map((asset) => ({
            address:
              "token" in asset.info
                ? asset.info.token.contract_addr
                : asset.info.native_token.denom,
            amount: asset.amount,
          }));

          if (
            poolAssets &&
            poolAssets.length > 1 &&
            Numeric.parse(pool.total_share).gt(0) &&
            Numeric.parse(amount).gt(0)
          ) {
            const amountInNumeric = Numeric.parse(amount);
            setResult({
              estimatedAmount: poolAssets.map((p) => ({
                ...p,
                amount: amountInNumeric
                  .mul(p.amount)
                  .div(pool.total_share)
                  .floor()
                  .toPrecision(64)
                  .split(".")[0],
              })),
              percentageOfShare: amountInNumeric.mul(100).toString(),
            });
            return;
          }
        }
        setIsFailed(true);
        setResult(undefined);
      } catch (error) {
        console.log(error);
        setIsFailed(true);
        setResult(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPool();

    return () => {
      isAborted = true;
    };
  }, [pairAddress, liquidityTokenAddress, amount, networkName, pool]);

  return useMemo(
    () => ({ ...result, isLoading, isFailed }),
    [isFailed, isLoading, pool, result],
  );
};

export default useSimulate;
