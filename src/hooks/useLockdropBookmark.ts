import { useAtom } from "jotai";
import { useCallback, useMemo } from "react";

import useNetwork from "~/hooks/useNetwork";

import { lockdropBookmarksAtom } from "~/stores/lockdrops";

const useLockdropBookmark = () => {
  const { chainName } = useNetwork();
  const [bookmarkStore, setBookmarkStore] = useAtom(lockdropBookmarksAtom);

  const toggleBookmark = useCallback(
    (address: string) =>
      setBookmarkStore((current) => {
        if (current[chainName]?.includes(address)) {
          return {
            ...current,
            [chainName]: current[chainName]?.filter((v) => v !== address),
          };
        }
        return {
          ...current,
          [chainName]: [...(current[chainName] || []), address],
        };
      }),
    [chainName, setBookmarkStore],
  );

  return useMemo(
    () => ({
      bookmarks: bookmarkStore[chainName],
      toggleBookmark,
    }),
    [chainName, bookmarkStore, toggleBookmark],
  );
};

export default useLockdropBookmark;
