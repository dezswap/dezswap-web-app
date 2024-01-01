import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useMemo } from "react";
import {
  notificationFirstSeenDateAtom,
  readNotificationsAtom,
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
  const [readNotifications, setReadNotifications] = useAtom(
    readNotificationsAtom,
  );

  const notifications = useMemo(() => {
    return (
      notices?.map((notice) => {
        const isRead =
          readNotifications.includes(notice.id) ||
          new Date(notice.date) < notificationFirstSeenDate;
        return {
          ...notice,
          isRead,
        };
      }) || []
    );
  }, [notices, notificationFirstSeenDate, readNotifications]);

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
        setReadNotifications((current) =>
          [...current, id].filter(
            (item, index, array) => array.indexOf(item) === index,
          ),
        );
      },
    }),
    [notifications, setReadNotifications],
  );
};

export default useNotifications;
