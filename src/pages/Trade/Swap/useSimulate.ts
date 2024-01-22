import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Numeric } from "@xpla/xpla.js";
import { ReverseSimulation, Simulation } from "types/pair";
import usePairs from "hooks/usePairs";
import useNetwork from "hooks/useNetwork";
import useAPI from "hooks/useAPI";
import useLCDClient from "hooks/useLCDClient";

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
  const network = useNetwork();
  const api = useAPI();

  const deferredAmount = useDeferredValue(amount);

  useEffect(() => {
    let isAborted = false;
    const simulate = async () => {
      try {
        if (
          !fromAddress ||
          !toAddress ||
          !deferredAmount ||
          Numeric.parse(deferredAmount).isZero() ||
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
          const res = await api.simulate(
            pair.contract_addr,
            fromAddress,
            deferredAmount.toString(),
          );
          if (res && !isAborted) {
            setResult(res);
          }
        }

        if (isReversed) {
          const res = await api.reverseSimulate(
            pair.contract_addr,
            toAddress,
            deferredAmount.toString(),
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
        setIsLoading(false);
        console.log(error);
      }
    };

    setIsLoading(true);
    simulate();

    return () => {
      isAborted = true;
    };
  }, [
    deferredAmount,
    findPair,
    fromAddress,
    isReversed,
    lcd,
    toAddress,
    network.name,
  ]);

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
