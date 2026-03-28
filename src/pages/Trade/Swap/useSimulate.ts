import { Numeric } from "@xpla/xpla.js";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { useCosmWasmClient } from "~/components/Providers/ClientProvider";
import { useNetwork } from "~/hooks/useNetwork";
import usePairs from "~/hooks/usePairs";
import {
  generateReverseSimulationMsg,
  generateSimulationMsg,
} from "~/utils/dezswap";

import { ReverseSimulation, Simulation } from "~/types/pair";

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
  const { findPair } = usePairs();
  const [result, setResult] = useState<
    Simulation | ReverseSimulation | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const isSimulated = useRef(false);
  const { chainName } = useNetwork();
  const client = useCosmWasmClient();

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
        if (!client) {
          setIsLoading(false);
          return;
        }
        if (!isReversed) {
          const res = (await client.queryContractSmart(
            pair.contract_addr,
            generateSimulationMsg(fromAddress, deferredAmount.toString()),
          )) as Simulation;
          if (res && !isAborted) {
            setResult(res);
          }
        }

        if (isReversed) {
          const res = (await client.queryContractSmart(
            pair.contract_addr,
            generateReverseSimulationMsg(toAddress, deferredAmount.toString()),
          )) as ReverseSimulation;
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
    toAddress,
    chainName,
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
