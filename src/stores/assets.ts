import { atomWithStorage } from "jotai/utils";
import { NetworkName } from "types/common";
import { Token } from "types/api";

interface CustomToken extends Token {
  updatedAt?: Date;
}

export const customAssetsAtom = atomWithStorage<{
  [K in string]?: CustomToken[];
}>("customAssets", { xpla: [], xplatestnet: [] });

export const bookmarksAtom = atomWithStorage<{
  [K in string]?: string[];
}>("bookmarks", { xpla: [], xplatestnet: [] });
