import { Coin, Fee } from "@xpla/xpla.js";
import {
  MsgExecuteContract,
} from "cosmjs-types/cosmwasm/wasm/v1/tx";
import type { EncodeObject } from "@cosmjs/proto-signing";
import axios, { AxiosError } from "axios";
import { useDeferredValue, useEffect, useState } from "react";

import { useStargateClient } from "~/components/Providers/ClientProvider";
import { createEncodedTx } from "~/utils/dezswap";
import { calculateStdFee } from "~/utils/fee";

import useAuthSequence from "./useAuthSequence";
import { useConnectedWallet } from "./useConnectedWallet";
import { useNetwork } from "./useNetwork";

const useFee = (txOptions?: MsgExecuteContract[] | undefined) => {
  const { walletAddress } = useConnectedWallet() ?? {};
  const client = useStargateClient();
  const { chainName, selectedChain } = useNetwork();
  const [fee, setFee] = useState<Fee>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const { sequence, isLoading: isSequenceLoading } = useAuthSequence();
  const [errMsg, setErrMsg] = useState("");
  const deferredCreateTxOptions = useDeferredValue(txOptions);
  const messages: EncodeObject[] | undefined = deferredCreateTxOptions?.map(
    (msg) => ({
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: MsgExecuteContract.encode(MsgExecuteContract.fromPartial(msg)).finish(),
    }),
  );

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

        const txBytes = createEncodedTx(messages, sequence);
        const restEndpoint = selectedChain?.apis?.rest?.[0]?.address;
        if (!restEndpoint) {
          setIsLoading(false);
          return;
        }

        const { data: res } = await axios.post(
          `${restEndpoint}/cosmos/tx/v1beta1/simulate`,
          {
            tx_bytes: Buffer.from(txBytes).toString("base64"),
          },
        );

        const stdFee = calculateStdFee(
          BigInt(res?.gas_info?.gas_used ?? "0"),
          chainName,
        );

        if (stdFee && !isAborted) {
          setFee(
            new Fee(Number(stdFee.gas), [
              new Coin(stdFee.amount[0].denom, stdFee.amount[0].amount),
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
