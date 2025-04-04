import { atomWithStorage } from "jotai/utils";

export const lockdropBookmarksAtom = atomWithStorage<{
  [K in string]?: string[];
}>("lockdrop-bookmarks", { xpla: [], xplatestnet: [] });
