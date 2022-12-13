import { atom } from "jotai";
import { NetworkName, PairExtended } from "types/common";

const pairsAtom = atom<{
  [K in NetworkName]?: { data?: PairExtended[] };
}>({});

export const isPairsLoadingAtom = atom(false);

export default pairsAtom;
