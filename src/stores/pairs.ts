import { atomWithStorage } from "jotai/utils";
import { NetworkName } from "types/common";

export const bookmarksAtom = atomWithStorage<{
  [K in NetworkName]?: string[];
}>("pair-bookmarks", { mainnet: [], testnet: [] });
