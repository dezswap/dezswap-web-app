import { atomWithStorage } from "jotai/utils";

export type SlippagePreset = "0.3" | "0.5" | "1.0";
export const slippagePresets: SlippagePreset[] = ["0.3", "0.5", "1.0"];

export const selectedSlippagePresetAtom = atomWithStorage<
  SlippagePreset | "custom"
>("slippageToleranceType", "0.5");
export const customSlippageToleranceAtom = atomWithStorage<number | undefined>(
  "slippageTolerance",
  undefined,
);
