import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type Notification = {
  id: string;
  chain: string;
  title: string;
  description: string;
  timestamp: number | string | Date;
};

export const notificationsAtom = atom<Notification[]>([]);

export const readNotificationIdsAtom = atomWithStorage<string[]>(
  "readNotificationIds",
  [],
);

const firstSeen = atomWithStorage<string | undefined>(
  "notificationFirstSeenDate",
  localStorage.getItem("notificationFirstSeenDate") ?? undefined,
);

export const notificationFirstSeenDateAtom = atom<
  Date | undefined,
  [Date],
  void
>(
  (get) => {
    const l = get(firstSeen);
    return l ? new Date(l) : undefined;
  },
  (_get, set, update) => set(firstSeen, update.toString()),
);
