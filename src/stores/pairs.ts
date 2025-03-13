import { atomWithStorage } from "jotai/utils";

export const bookmarksAtom = atomWithStorage<{
  [K in string]?: string[];
}>("pair-bookmarks", { mainnet: [], testnet: [] });
