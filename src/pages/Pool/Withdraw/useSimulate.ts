import { Numeric } from "@xpla/xpla.js";
import { useEffect, useMemo, useState } from "react";
import usePool from "hooks/usePool";
import { useNetwork } from "hooks/useNetwork";
import useAssets from "hooks/useAssets";

export interface WithdrawSimulationResult {
  estimatedAmount1: string;
  estimatedAmount2: string;
  poolAssets: { address: string; amount: string }[];
  percentageOfShare: string;
}

const useSimulate = (
  pairAddress: string,
  liquidityTokenAddress: string,
  amount: string,
) => {
  const { name: networkName } = useNetwork();
  const pool = usePool(pairAddress);
  const { getAsset } = useAssets();
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
              estimatedAmount1: amountInNumeric
                .mul(poolAssets[0].amount)
                .div(pool.total_share)
                .floor()
                .toString(),
              estimatedAmount2: amountInNumeric
                .mul(poolAssets[1].amount)
                .div(pool.total_share)
                .floor()
                .toString(),
              poolAssets,
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
  }, [pairAddress, liquidityTokenAddress, amount, getAsset, networkName, pool]);

  return useMemo(
    () => ({ ...result, isLoading, isFailed }),
    [isFailed, isLoading, pool, result],
  );
};

export default useSimulate;
