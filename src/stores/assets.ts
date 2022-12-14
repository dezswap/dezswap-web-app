import { atomWithStorage } from "jotai/utils";
import { Asset, NetworkName } from "types/common";
import { atom } from "jotai";
import { VerifiedAssets } from "types/token";

const assetsAtom = atomWithStorage<{
  [K in NetworkName]?: Asset[];
}>("assets", { mainnet: [], testnet: [] });

export const verifiedAssetsAtom = atom<VerifiedAssets | undefined>(undefined);

export default assetsAtom;
