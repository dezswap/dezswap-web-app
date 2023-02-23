import { useAtom } from "jotai";
import { useMemo } from "react";
import {
  selectedSlippagePresetAtom,
  customSlippageToleranceAtom,
  DEFAULT_SLIPPAGE_TOLERANCE,
} from "stores/settings";

const useSlippageTolerance = () => {
  const [selectedPreset, setSelectedPreset] = useAtom(
    selectedSlippagePresetAtom,
  );
  const [customValue, setCustomValue] = useAtom(customSlippageToleranceAtom);

  const value = useMemo(() => {
    if (selectedPreset === "custom") {
      return customValue ?? Number(DEFAULT_SLIPPAGE_TOLERANCE);
    }
    return Number(selectedPreset);
  }, [customValue, selectedPreset]);

  return {
    value,
    selectedPreset,
    setSelectedPreset,
    customValue,
    setCustomValue,
  };
};

export default useSlippageTolerance;
