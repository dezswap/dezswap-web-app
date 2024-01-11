import { useInfiniteQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useMemo } from "react";
import {
  notificationFirstSeenDateAtom,
  readNotificationIdsAtom,
} from "stores/notifications";
import useNetwork from "./useNetwork";
import useAPI from "./useAPI";

const useNotifications = () => {
  const network = useNetwork();
  const api = useAPI();

  const { fetchNextPage, data, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["notices", network.chainID],
    queryFn: async ({ pageParam }) => {
      const res = await api.getNotices({
        asc: false,
        limit: 9999, // TODO: Pagination
        after: pageParam,
      });
      return res;
    },
    getNextPageParam: (lastPage) => {
      const lastItem = lastPage[lastPage.length - 1];
      return lastItem?.id;
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
