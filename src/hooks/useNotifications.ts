import { useInfiniteQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useMemo } from "react";

import {
  getGetNoticesQueryKey,
  getNotices,
} from "~/api/dezswap/endpoints/notice/notice";
import type { GetNoticesParams } from "~/api/dezswap/models";

import {
  notificationFirstSeenDateAtom,
  readNotificationIdsAtom,
} from "~/stores/notifications";

const useGetNoticesInfinite = (params?: GetNoticesParams) => {
  return useInfiniteQuery({
    queryKey: getGetNoticesQueryKey(params),
    queryFn: ({ signal, pageParam }) =>
      getNotices({ ...params, after: pageParam }, undefined, signal),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      const lastItem = lastPage.at(-1);
      return lastItem?.id ? +lastItem.id : undefined;
    },
  });
};

const useNotifications = () => {
  const {
    fetchNextPage: fetchMore,
    data,
    hasNextPage,
    isLoading,
  } = useGetNoticesInfinite({
    asc: false,
    limit: 9999, // TODO: Pagination
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
      fetchMore,
      hasNextPage,
      isLoading,
    }),
    [fetchMore, hasNextPage, isLoading, notifications, setReadNotificationIds],
  );
};

export default useNotifications;
