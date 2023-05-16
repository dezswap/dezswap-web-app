import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

const lastSeen = atomWithStorage<string | undefined>(
  "disclaimer",
  localStorage.getItem("disclaimer") ?? undefined, // https://github.com/pmndrs/jotai/discussions/1737
);

const disclaimerLastSeenAtom = atom<Date, [Date], void>(
  (get) => {
    const l = get(lastSeen);
    return l ? new Date(l) : new Date(0);
  },
  (_get, set, update) => set(lastSeen, update.toString()),
);

export default disclaimerLastSeenAtom;
