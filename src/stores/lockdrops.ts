import { atomWithStorage } from "jotai/utils";
import { NetworkName } from "types/common";

export const lockdropBookmarksAtom = atomWithStorage<{
  [K in NetworkName]?: string[];
}>("lockdrop-bookmarks", { mainnet: [], testnet: [] });
