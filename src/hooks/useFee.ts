import type { StdFee } from "@interchainjs/types";
import type { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";
import { AxiosError } from "axios";
import { useDeferredValue, useEffect, useState } from "react";

import useAPI from "./useAPI";
import useAuthSequence from "./useAuthSequence";
import { useConnectedWallet } from "./useConnectedWallet";
import useRPCClient from "./useRPCClient";

const useFee = (messages?: MsgExecuteContract[]) => {
  const { walletAddress } = useConnectedWallet() ?? {};
  const { client } = useRPCClient();
  const [fee, setFee] = useState<StdFee>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const api = useAPI();
  const { sequence } = useAuthSequence();
  const [errMsg, setErrMsg] = useState("");
  const deferredMessages = useDeferredValue(messages);

  useEffect(() => {
    setIsLoading(true);
    setIsFailed(false);
  }, [messages]);

  useEffect(() => {
    let isAborted = false;
    if (!walletAddress || !deferredMessages) {
      setIsLoading(false);
      return () => {
        isAborted = true;
      };
    }

    const estimateFee = async () => {
      try {
        if (!walletAddress || !deferredMessages) {
          setFee(undefined);
          setErrMsg("");
          setIsFailed(false);
          setIsLoading(false);
          return;
        }

        const estimatedFee = await api.estimateFee(deferredMessages, sequence);

        if (estimatedFee && !isAborted) {
          setFee(estimatedFee);
          setErrMsg("");
          setIsLoading(false);
          setIsFailed(false);
        }
      } catch (error) {
        console.log(error);
        const msg = (error as AxiosError<{ message: string }>)?.response?.data
          .message;
        if (msg) {
          if (msg.includes("Invalid zero amount")) {
            setErrMsg(
              "The amount of asset received is zero, please increase your LP amount to withdraw.",
            );
          }
          if (
            msg.includes("Max spread assertion") ||
            msg.includes("Max slippage assertion") ||
            msg.includes("Min amount assertion")
          ) {
            setErrMsg(
              "The estimated slippage has been exceeded the tolerance.",
            );
          }
        }
        if (!isAborted) {
          setFee(undefined);
          setIsFailed(true);
          setIsLoading(false);
        }
      }
    };

    const timerId = setTimeout(
      () => {
        if (!isAborted) {
          estimateFee();
        }
      },
      fee ? 750 : 125,
    );

    setIsFailed(false);
    setIsLoading(true);

    return () => {
      isAborted = true;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [walletAddress, client, deferredMessages]); // eslint-disable-line react-hooks/exhaustive-deps

  return { fee, isLoading, isFailed, errMsg };
};

export default useFee;
