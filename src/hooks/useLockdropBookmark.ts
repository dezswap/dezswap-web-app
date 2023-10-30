import { useCallback, useMemo } from "react";
import useNetwork from "hooks/useNetwork";
import { lockdropBookmarksAtom } from "stores/lockdrops";
import { useAtom } from "jotai";

const useLockdropBookmark = () => {
  const network = useNetwork();
  const [bookmarkStore, setBookmarkStore] = useAtom(lockdropBookmarksAtom);

  const toggleBookmark = useCallback(
    (address: string) =>
      setBookmarkStore((current) => {
        if (current[network.name]?.includes(address)) {
          return {
            ...current,
            [network.name]: current[network.name]?.filter((v) => v !== address),
          };
        }
        return {
          ...current,
          [network.name]: [...(current[network.name] || []), address],
        };
      }),
    [network.name, setBookmarkStore],
  );

  return useMemo(
    () => ({
      bookmarks: bookmarkStore[network.name],
      toggleBookmark,
    }),
    [network.name, bookmarkStore, toggleBookmark],
  );
};

export default useLockdropBookmark;
