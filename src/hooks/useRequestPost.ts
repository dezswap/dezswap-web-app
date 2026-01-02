import type { CosmosSignArgs } from "@interchainjs/cosmos";
import type { StdFee } from "@interchainjs/types";
import { ConnectType, CreateTxFailed } from "@xpla/wallet-provider";
import type { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";
import { useCallback, useEffect, useState, useTransition } from "react";

import { TxError } from "~/types/common";

import { toCosmosMessages } from "~/utils/encode";

import useConfirmationModal from "./modals/useConfirmationModal";
import useTxBroadcastingModal from "./modals/useTxBroadcastingModal";
import { useConnectedWallet } from "./useConnectedWallet";

const useRequestPost = (onDoneTx?: () => void, isModalParent = false) => {
  const { post, connectType } = useConnectedWallet() ?? {};
  const [signArgs, setSignArgs] = useState<CosmosSignArgs>();
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<TxError>();
  const txBroadcastModal = useTxBroadcastingModal({
    txHash,
    txError,
    onDoneClick: onDoneTx,
  });

  const [fee, setFee] = useState<StdFee>();

  const postTx = useCallback(
    async (_signArgs: CosmosSignArgs) => {
      if (post) {
        try {
          txBroadcastModal.open();
          const { result } = await post(_signArgs);
          if (result.raw_log !== "") {
            // TODO: error ?
          }
          setTxHash(result.txhash);
        } catch (error) {
          console.log(error);
          if (
            error instanceof CreateTxFailed &&
            connectType === ConnectType.WALLETCONNECT
          ) {
            error.message =
              "Transaction creation failed, please check the details in your wallet and try again";
          }
          if (error instanceof Error) {
            setTxError(error);
          }
        }
      }
    },
    [post, connectType, txBroadcastModal],
  );

  const handleConfirm = useCallback(async () => {
    if (signArgs) {
      postTx({ ...signArgs, fee: fee ?? signArgs.fee });
    }
  }, [fee, postTx, signArgs]);

  const [node, setNode] = useState<Node>();
  const confirmationModal = useConfirmationModal({
    node,
    onConfirm: handleConfirm,
    isModalParent,
  });

  const [, startTransition] = useTransition();

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (!confirmationModal.isOpen) {
        setNode(undefined);
      }
    }, 300);
    return () => {
      clearTimeout(timerId);
    };
  }, [confirmationModal.isOpen]);

  const requestPost = useCallback(
    (args: {
      messages: MsgExecuteContract[];
      fee?: StdFee;
      formElement?: HTMLFormElement;
      skipConfirmation?: boolean;
    }) => {
      const cosmosSignArgs: CosmosSignArgs = {
        messages: toCosmosMessages(args.messages),
        fee: args.fee,
      };

      if (args.skipConfirmation) {
        postTx(cosmosSignArgs);
        return;
      }

      startTransition(() => {
        setSignArgs(cosmosSignArgs);
        setFee(args.fee);
        if (!args.formElement) {
          setNode(undefined);
          return;
        }
        const newNode = document.importNode(args.formElement, true);
        newNode.addEventListener("submit", (e) => {
          e.preventDefault();
        });
        setNode(newNode);
      });

      confirmationModal.open();
    },
    [confirmationModal, postTx],
  );

  return { requestPost };
};

export default useRequestPost;
