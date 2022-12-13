import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Numeric } from "@xpla/xpla.js";
import { ReverseSimulation, Simulation } from "types/pair";
import {
  generateReverseSimulationMsg,
  generateSimulationMsg,
} from "utils/dezswap";
import { useLCDClient } from "@xpla/wallet-provider";
import usePairs from "hooks/usePair";

const useSimulate = ({
  fromAddress,
  toAddress,
  amount,
  isReversed,
}: {
  fromAddress?: string;
  toAddress?: string;
  amount?: Numeric.Input;
  isReversed?: boolean;
}) => {
  const lcd = useLCDClient();
  const { findPair } = usePairs();
  const [result, setResult] = useState<
    Simulation | ReverseSimulation | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const isSimulated = useRef(false);

  const deferredAmount = useDeferredValue(amount);

  useEffect(() => {
    let isAborted = false;
    const simulate = async () => {
      try {
        if (
          !fromAddress ||
          !toAddress ||
          !deferredAmount ||
          Numeric.parse(deferredAmount).isNaN()
        ) {
          setIsLoading(false);
          setResult(undefined);
          return;
        }
        const pair = findPair([fromAddress, toAddress]);
        if (!pair) {
          setIsLoading(false);
          return;
        }
        if (!isReversed) {
          const res = await lcd.wasm.contractQuery<Simulation>(
            pair.contract_addr,
            generateSimulationMsg(fromAddress, deferredAmount),
          );
          if (res && !isAborted) {
            setResult(res);
          }
        }

        if (isReversed) {
          const res = await lcd.wasm.contractQuery<ReverseSimulation>(
            pair.contract_addr,
            generateReverseSimulationMsg(toAddress, deferredAmount),
          );
          if (res && !isAborted) {
            setResult(res);
          }
        }

        if (!isAborted) {
          setIsLoading(false);
          isSimulated.current = true;
        }
      } catch (error) {
        console.log(error);
      }
    };

    setIsLoading(true);
    simulate();

    return () => {
      isAborted = true;
    };
  }, [deferredAmount, findPair, fromAddress, isReversed, lcd, toAddress]);

  return useMemo(
    () => ({
      estimatedAmount: isReversed
        ? (result as ReverseSimulation | undefined)?.offer_amount
        : (result as Simulation | undefined)?.return_amount,
      commissionAmount: result?.commission_amount,
      spreadAmount: result?.spread_amount,
      isReversed,
      isLoading,
    }),
    [isLoading, isReversed, result],
  );
};

export default useSimulate;
