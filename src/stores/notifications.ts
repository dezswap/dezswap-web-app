import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type Notification = {
  id: string;
  title: string;
  description: string;
  timestamp: number | string | Date;
};

export const notificationsAtom = atom<Notification[]>([]);

export const readNotificationsAtom = atom<string[]>([]);

const firstSeen = atomWithStorage<string | undefined>(
  "notificationFirstSeenDate",
  localStorage.getItem("notificationFirstSeenDate") ?? undefined,
);

export const notificationFirstSeenDateAtom = atom<Date, [Date], void>(
  (get) => {
    const l = get(firstSeen);
    return l ? new Date(l) : new Date(0);
  },
  (_get, set, update) => set(firstSeen, update.toString()),
);
