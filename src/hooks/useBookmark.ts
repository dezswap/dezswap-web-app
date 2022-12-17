import { useCallback, useMemo } from "react";
import { useNetwork } from "hooks/useNetwork";
import { bookmarksAtom } from "stores/assets";
import { useAtom } from "jotai";

const useBookmark = () => {
  const network = useNetwork();
  const [bookmarkStore, setBookmarkStore] = useAtom(bookmarksAtom);

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
    [bookmarkStore, network.name, setBookmarkStore],
  );

  return useMemo(
    () => ({
      bookmarks: bookmarkStore[network.name],
      toggleBookmark,
    }),
    [network.name, bookmarkStore, toggleBookmark],
  );
};

export default useBookmark;
