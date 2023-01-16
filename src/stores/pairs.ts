import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { NetworkName, PairExtended } from "types/common";

const pairsAtom = atom<{
  [K in NetworkName]?: { data?: PairExtended[] };
}>({});

export const isPairsLoadingAtom = atom(false);

export const bookmarksAtom = atomWithStorage<{
  [K in NetworkName]?: string[];
}>("bookmarks", { mainnet: [], testnet: [] });

export default pairsAtom;
