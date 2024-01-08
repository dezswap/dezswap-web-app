import { useQuery } from "@tanstack/react-query";
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
  const { data: notices } = useQuery({
    queryKey: ["notices", network.chainID],
    queryFn: () => api.getNotices(),
  });

  const [notificationFirstSeenDate, setNotificationFirstSeenDate] = useAtom(
    notificationFirstSeenDateAtom,
  );
  const [readNotificationIds, setReadNotificationIds] = useAtom(
    readNotificationIdsAtom,
  );

  const notifications = useMemo(() => {
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
  }, [notices, notificationFirstSeenDate, readNotificationIds]);

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
    }),
    [notifications, setReadNotificationIds],
  );
};

export default useNotifications;
