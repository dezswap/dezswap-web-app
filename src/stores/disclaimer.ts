import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

const lastSeen = atomWithStorage<string | undefined>("disclaimer", undefined);

const disclaimerLastSeenAtom = atom<Date | undefined, Date>(
  (get) => {
    const l = get(lastSeen);
    return l ? new Date(l) : undefined;
  },
  (_get, set, update) => set(lastSeen, update.toString()),
);

export default disclaimerLastSeenAtom;
