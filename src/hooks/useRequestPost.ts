import { ConnectType, CreateTxFailed, TxResult } from "@xpla/wallet-provider";
import { CreateTxOptions, Fee } from "@xpla/xpla.js";
import { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";
import { DeliverTxResponse } from "@xpla/xplajs/types";
import { useCallback, useEffect, useState, useTransition } from "react";
import { TxError } from "types/common";
import { convertProtoToAminoMsg } from "utils/dezswap";
import useConfirmationModal from "./modals/useConfirmationModal";
import useTxBroadcastingModal from "./modals/useTxBroadcastingModal";
import useConnectedWallet from "./useConnectedWallet";

export interface NewMsgTxOptions extends Omit<CreateTxOptions, "msgs"> {
  msgs: MsgExecuteContract[];
}

const useRequestPost = (onDoneTx?: () => void, isModalParent = false) => {
  const connectedWallet = useConnectedWallet();
  const [args, setArgs] = useState<NewMsgTxOptions>();
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<TxError>();
  const txBroadcastModal = useTxBroadcastingModal({
    txHash,
    txError,
    onDoneClick: onDoneTx,
  });

  const [fee, setFee] = useState<Fee>();

  const postTx = useCallback(
    async (createTxOptions: NewMsgTxOptions) => {
      if (connectedWallet.isInterchain || connectedWallet.availablePost) {
        try {
          txBroadcastModal.open();
          const result = await connectedWallet.post({
            ...createTxOptions,
            msgs: createTxOptions.msgs,
          });
          if (connectedWallet.isInterchain && result) {
            const { transactionHash } = result as DeliverTxResponse;
            setTxHash(transactionHash);
          } else {
            const { result: res } = result as TxResult;
            setTxHash(res.txhash);
          }
        } catch (error) {
          console.log(error);
          if (
            error instanceof CreateTxFailed &&
            connectedWallet.connectType === ConnectType.WALLETCONNECT
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
    [connectedWallet.walletAddress, txBroadcastModal],
  );

  const handleConfirm = useCallback(async () => {
    if (args) {
      postTx({ ...args, fee: fee ?? args.fee });
    }
  }, [fee, postTx, args]);

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
    (createTxOptions: {
      txOptions: NewMsgTxOptions;
      fee?: Fee;
      formElement?: HTMLFormElement;
      skipConfirmation?: boolean;
    }) => {
      if (createTxOptions.skipConfirmation) {
        if (createTxOptions.txOptions || connectedWallet.isInterchain) {
          postTx({
            ...createTxOptions.txOptions,
            fee: createTxOptions.fee ?? createTxOptions.txOptions.fee,
          });
        }
        return;
      }

      startTransition(() => {
        setArgs({ ...createTxOptions.txOptions });
        setFee(createTxOptions.fee);
        if (!createTxOptions.formElement) {
          setNode(undefined);
          return;
        }
        const newNode = document.importNode(createTxOptions.formElement, true);
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
