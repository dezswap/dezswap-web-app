import { atomWithStorage } from "jotai/utils";

export type SlippagePreset = "0.3" | "0.5" | "1.0";
export const slippagePresets: SlippagePreset[] = ["0.3", "0.5", "1.0"];
export const DEFAULT_SLIPPAGE_TOLERANCE = "0.5";

export const selectedSlippagePresetAtom = atomWithStorage<
  SlippagePreset | "custom"
>("slippageToleranceType", DEFAULT_SLIPPAGE_TOLERANCE);
export const customSlippageToleranceAtom = atomWithStorage<
  number | undefined | null
>("slippageTolerance", undefined);

export const txDeadlineMinutesAtom = atomWithStorage<number | undefined | null>(
  "txDeadline",
  undefined,
);
