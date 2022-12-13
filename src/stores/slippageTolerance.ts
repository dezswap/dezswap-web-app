import { atomWithStorage } from "jotai/utils";

export type SlippagePreset = "0.1" | "0.5" | "1.0" | "2.0";
export const slippagePresets: SlippagePreset[] = ["0.1", "0.5", "1.0", "2.0"];

export const selectedSlippagePresetAtom = atomWithStorage<
  SlippagePreset | "custom"
>("slippageToleranceType", "1.0");
export const customSlippageToleranceAtom = atomWithStorage<number | undefined>(
  "slippageTolerance",
  undefined,
);
