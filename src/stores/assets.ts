import { atomWithStorage } from "jotai/utils";
import { Asset, NetworkName } from "types/common";

const assetsAtom = atomWithStorage<{
  [K in NetworkName]?: Partial<Asset>[];
}>("assets", {});

export default assetsAtom;
