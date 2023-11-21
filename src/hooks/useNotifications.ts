import { useAtom } from "jotai";
import { useEffect, useMemo } from "react";
import {
  Notification,
  notificationFirstSeenDateAtom,
  readNotificationsAtom,
} from "stores/notifications";

const notifications: Notification[] = [
  {
    id: "1",
    title:
      "First notificationFirst notificationFirst notificationFirst notificationFirst notificationFirst notificationFirst notificationFirst notificationFirst notificationFirst notificationFirst notificationFirst notificationFirst notification",
    description: `This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification
    This is the first notification`,
    date: new Date(),
  },
  {
    id: "2",
    title: "Second notification",
    description: "This is the second notification",
    date: new Date(),
  },
  {
    id: "3",
    title: "Third notification",
    description: "This is the third notification",
    date: new Date(),
  },
];

const useNotifications = () => {
  const [notificationFirstSeenDate, setNotificationFirstSeenDate] = useAtom(
    notificationFirstSeenDateAtom,
  );
  const [readNotifications, setReadNotifications] = useAtom(
    readNotificationsAtom,
  );

  useEffect(() => {
    if (!notificationFirstSeenDate) {
      setNotificationFirstSeenDate(new Date());
    }
  }, [notificationFirstSeenDate, setNotificationFirstSeenDate]);

  return useMemo(
    () => ({
      notifications: notifications.map((notification) => {
        const isRead =
          readNotifications.includes(notification.id) ||
          new Date(notification.date) < notificationFirstSeenDate;
        return {
          ...notification,
          isRead,
        };
      }),
      markAsRead: (id: string) => {
        setReadNotifications((current) =>
          [...current, id].filter(
            (item, index, array) => array.indexOf(item) === index,
          ),
        );
      },
    }),
    [notificationFirstSeenDate, readNotifications, setReadNotifications],
  );
};

export default useNotifications;
