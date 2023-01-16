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

const useSimulate = ({
  pairAddress,
  asset1Address,
  asset1Amount,
  asset2Address,
  asset2Amount,
}: {
  pairAddress: string;
  asset1Address: string;
  asset1Amount: string;
  asset2Address?: string;
  asset2Amount?: string;
}) => {
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
        if (pool) {
          const poolAssets = pool.assets.map((asset) => ({
            address:
              "token" in asset.info
                ? asset.info.token.contract_addr
                : asset.info.native_token.denom,
            amount: asset.amount,
          }));

          if (poolAssets && poolAssets.length > 1) {
            if (asset1Address && asset1Amount) {
              if (asset2Address && asset2Amount) {
                setResult({
                  estimatedAmount: asset2Amount,
                  poolAssets,
                  percentageOfShare: "100",
                  share: Numeric.parse(asset1Amount)
                    .mul(asset2Amount)
                    .sqrt()
                    .floor()
                    .toString(),
                });
                return;
              }

              const [poolAsset1, poolAsset2] = poolAssets.sort((a) =>
                a?.address === asset1Address ? -1 : 1,
              );

              const depositAmount = Numeric.parse(asset1Amount);
              if (
                Numeric.parse(pool.total_share).gt(0) &&
                depositAmount.gt(0)
              ) {
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
  }, [getAsset, asset1Address, asset1Amount, asset2Address, asset2Amount]);

  return useMemo(
    () => ({ ...result, isLoading, isFailed }),
    [isFailed, isLoading, result],
  );
};

export default useSimulate;
