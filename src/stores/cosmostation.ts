import { Cosmos } from "@cosmostation/extension-client";
import { RequestAccountResponse } from "@cosmostation/extension-client/types/message";
import { atom } from "jotai";

export const cosmostationAtom = atom<
  | {
      provider?: Cosmos;
      account?: RequestAccountResponse;
    }
  | undefined
>(undefined);
