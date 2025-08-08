import { useDeferredValue, useEffect, useState } from "react";
import { Coin, Fee } from "@xpla/xpla.js";
import type { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";
import { MessageComposer } from "@xpla/xplajs/cosmwasm/wasm/v1/tx.registry";
import { AxiosError } from "axios";
import useAPI from "./useAPI";
import useConnectedWallet from "./useConnectedWallet";
import useRPCClient from "./useRPCClient";
import useAuthSequence from "./useAuthSequence";

const useFee = (txOptions?: MsgExecuteContract[] | undefined) => {
  const { walletAddress } = useConnectedWallet();
  const { client } = useRPCClient();
  const [fee, setFee] = useState<Fee>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const api = useAPI();
  const { sequence, isLoading: isSequenceLoading } = useAuthSequence();
  const [errMsg, setErrMsg] = useState("");
  const deferredCreateTxOptions = useDeferredValue(txOptions);
  const { executeContract } = MessageComposer.encoded;
  const messages = deferredCreateTxOptions?.map((msg) => executeContract(msg));

  useEffect(() => {
    setIsLoading(true);
    setIsFailed(false);
  }, [txOptions]);

  useEffect(() => {
    let isAborted = false;
    if (!walletAddress || !deferredCreateTxOptions || isSequenceLoading) {
      setIsLoading(false);
      return () => {
        isAborted = true;
      };
    }

    const estimateFee = async () => {
      try {
        if (!walletAddress || !messages) {
          setFee(undefined);
          setErrMsg("");
          setIsFailed(false);
          setIsLoading(false);
          return;
        }

        const res = await api.estimateFee(messages, sequence);
        if (res && !isAborted) {
          setFee(
            new Fee(Number(res.gas), [
              new Coin(res.amount[0].denom, res.amount[0].amount),
            ]),
          );

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
  }, [walletAddress, client, deferredCreateTxOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  return { fee, isLoading, isFailed, errMsg };
};

export default useFee;
