import {
  ConnectType,
  CreateTxFailed,
  TxFailed,
  TxResult,
} from "@xpla/wallet-provider";
import { CreateTxOptions, Fee } from "@xpla/xpla.js";
import { MsgExecuteContract } from "@xpla/xplajs/cosmwasm/wasm/v1/tx";
import { useCallback, useEffect, useState, useTransition } from "react";
import { TxError } from "types/common";
import { convertProtoToAmino } from "utils/dezswap";
import useConfirmationModal from "./modals/useConfirmationModal";
import useTxBroadcastingModal from "./modals/useTxBroadcastingModal";
import useConnectedWallet from "./useConnectedWallet";
import { IBroadcastResult } from "@interchainjs/types";

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
          const result = await connectedWallet.post(createTxOptions);

          if (connectedWallet.isInterchain && result) {
            // TODO: Fix it when interchainjs is updated
            // const InterchainResult = result as IBroadcastResult<unknown>;
            // console.log(InterchainResult);
            // setTxError(
            //   new TxFailed(
            //     convertProtoToAmino(createTxOptions),
            //     InterchainResult?.transactionHash ?? "no hash",
            //     InterchainResult?.rawResponse?.log || "",
            //     InterchainResult?.rawResponse?.log,
            //   ),
            // );
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
    [connectedWallet, txBroadcastModal],
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
    [confirmationModal, connectedWallet.isInterchain, postTx],
  );

  return { requestPost };
};

export default useRequestPost;
