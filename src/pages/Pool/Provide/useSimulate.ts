import useAssets from "hooks/useAssets";
import { useEffect, useMemo, useState } from "react";
import usePool from "hooks/usePool";
import { Numeric } from "@xpla/xpla.js";

export interface ProvideSimulationResult {
  estimatedAmount: string;
  poolAssets: { address: string; amount: string }[];
  percentageOfShare: string;
  share: string;
}

const useSimulate = (
  pairAddress: string,
  assetAddress: string,
  assetAmount: string,
) => {
  const pool = usePool(pairAddress);
  const { getAsset } = useAssets();
  const [isLoading, setIsLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [result, setResult] = useState<ProvideSimulationResult>();

  useEffect(() => {
    setIsLoading(true);
    setIsFailed(false);
    const fetchProvideInfos = async () => {
      try {
        if (assetAddress && assetAmount && pool) {
          const poolAssets = pool.assets.map((asset) => ({
            address:
              "token" in asset.info
                ? asset.info.token.contract_addr
                : asset.info.native_token.denom,
            amount: asset.amount,
          }));

          if (poolAssets.length > 1) {
            const [poolAsset1, poolAsset2] = poolAssets.sort((a) =>
              a?.address === assetAddress ? -1 : 1,
            );

            const depositAmount = Numeric.parse(assetAmount);
            if (Numeric.parse(pool.total_share).gt(0) && depositAmount.gt(0)) {
              const share = depositAmount
                .mul(pool.total_share)
                .div(poolAsset1.amount)
                .ceil();
              const estimated = share
                .mul(poolAsset2.amount)
                .div(pool.total_share)
                .ceil();

              setResult({
                estimatedAmount: estimated.toPrecision(64).split(".")[0],
                poolAssets,
                percentageOfShare: share
                  .mul(100)
                  .div(share.plus(pool.total_share))
                  .toString(),
                share: share.toString(),
              });
              return;
            }
          }
        }
        setIsFailed(true);
        setResult(undefined);
      } catch (error) {
        console.error(error);
        setIsFailed(true);
        setResult(undefined);
      } finally {
        setIsLoading(false);
      }
    };
    const timerId = setTimeout(() => {
      fetchProvideInfos();
    }, 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [assetAddress, getAsset, assetAmount]);

  return useMemo(
    () => ({ ...result, isLoading, isFailed }),
    [isFailed, isLoading, result],
  );
};

export default useSimulate;
