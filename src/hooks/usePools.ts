import { useGetPools } from "~/api/dezswap";
import type {
  ControllerPoolRes,
  DezswapAssetInfoRes,
} from "~/api/dezswap/models";

// TODO: check this is required for real
type PoolAsset = Omit<DezswapAssetInfoRes, "amount"> & { amount: string };

type Pool = Omit<ControllerPoolRes, "assets"> & {
  assets: [PoolAsset, PoolAsset];
};

export const usePools = useGetPools<Pool[]>;
export type { Pool, PoolAsset };
