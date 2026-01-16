import { useInfiniteQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useMemo } from "react";

import {
  notificationFirstSeenDateAtom,
  readNotificationIdsAtom,
} from "~/stores/notifications";

import useAPI from "./useAPI";
import useNetwork from "./useNetwork";

const useNotifications = () => {
  const {
    selectedChain: { chainId },
  } = useNetwork();
  const api = useAPI();

  const { fetchNextPage, data, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["notices", chainId],
    queryFn: async ({ pageParam }) => {
      const res = await api.getNotices({
        asc: false,
        limit: 9999, // TODO: Pagination
        after: pageParam,
      });
      return res;
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      const lastItem = lastPage.at(-1);
      return lastItem?.id ? +lastItem.id : undefined;
    },
  });

  const [notificationFirstSeenDate, setNotificationFirstSeenDate] = useAtom(
    notificationFirstSeenDateAtom,
  );
  const [readNotificationIds, setReadNotificationIds] = useAtom(
    readNotificationIdsAtom,
  );

  const notifications = useMemo(() => {
    const notices = data?.pages.flat();
    return (
      notices?.map((notice) => {
        const isRead =
          readNotificationIds.includes(notice.id) ||
          (notificationFirstSeenDate &&
            new Date(notice.timestamp) < notificationFirstSeenDate);
        return {
          ...notice,
          isRead,
        };
      }) || []
    );
  }, [data, notificationFirstSeenDate, readNotificationIds]);

  useEffect(() => {
    if (!notificationFirstSeenDate) {
      setNotificationFirstSeenDate(new Date());
    }
  }, [notificationFirstSeenDate, setNotificationFirstSeenDate]);

  return useMemo(
    () => ({
      notifications,
      hasUnread: notifications.some((notice) => !notice.isRead),
      markAsRead: (id: string) => {
        setReadNotificationIds((current) =>
          [...current, id].filter(
            (item, index, array) => array.indexOf(item) === index,
          ),
        );
      },
      fetchMore: () => fetchNextPage(),
      hasNextPage,
      isLoading,
    }),
    [
      fetchNextPage,
      hasNextPage,
      isLoading,
      notifications,
      setReadNotificationIds,
    ],
  );
};

export default useNotifications;
