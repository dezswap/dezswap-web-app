import { atomWithStorage } from "jotai/utils";
import { NetworkName } from "types/common";
import { Token } from "types/api";

interface CustomToken extends Token {
  updatedAt?: Date;
}

export const customAssetsAtom = atomWithStorage<{
  [K in NetworkName]?: CustomToken[];
}>("customAssets", { mainnet: [], testnet: [] });

export const bookmarksAtom = atomWithStorage<{
  [K in NetworkName]?: string[];
}>("bookmarks", { mainnet: [], testnet: [] });
