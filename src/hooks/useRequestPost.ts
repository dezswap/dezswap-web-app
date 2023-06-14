import {
  ConnectType,
  CreateTxFailed,
  TxResult,
  useConnectedWallet,
} from "@xpla/wallet-provider";
import { CreateTxOptions, Fee } from "@xpla/xpla.js";
import { useCallback, useEffect, useState, useTransition } from "react";
import { TxError } from "types/common";
import useConfirmationModal from "./modals/useConfirmationModal";
import useTxBroadcastingModal from "./modals/useTxBroadcastingModal";
import useCosmostationWallet from "./useCosmostationWallet";

const useRequestPost = (onDoneTx?: () => void, isModalParent = false) => {
  const connectedWallet = useConnectedWallet();
  const cosmostationWallet = useCosmostationWallet();
  const [txOptions, setTxOptions] = useState<CreateTxOptions>();

  const [txResult, setTxResult] = useState<TxResult>();
  const [txError, setTxError] = useState<TxError>();
  const txBroadcastModal = useTxBroadcastingModal({
    txHash: txResult?.result.txhash,
    txError,
    onDoneClick: onDoneTx,
  });

  const [fee, setFee] = useState<Fee>();
  const handleConfirm = useCallback(async () => {
    if (txOptions && fee) {
      if (connectedWallet?.availablePost) {
        try {
          txBroadcastModal.open();
          const result = await connectedWallet.post({
            ...txOptions,
            fee,
          });
          setTxResult(result);
        } catch (error) {
          console.log(error);
          if (
            error instanceof CreateTxFailed &&
            connectedWallet?.connectType === ConnectType.WALLETCONNECT
          ) {
            error.message =
              "Transaction creation failed, please check the details in your wallet and try again";
          }
          if (error instanceof Error) {
            setTxError(error);
          }
        }
      }

      // Cosmostation
      if (connectedWallet?.xplaAddress && !connectedWallet?.availablePost) {
        try {
          txBroadcastModal.open();
          const result = await cosmostationWallet.post(txOptions, fee);
          setTxResult(result);
        } catch (error) {
          console.log(error);
          if (error instanceof Error) {
            setTxError(error);
          }
        }
      }
    }
  }, [txOptions, fee, connectedWallet, txBroadcastModal, cosmostationWallet]);

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
      txOptions: CreateTxOptions;
      fee: Fee;
      formElement: HTMLFormElement;
    }) => {
      startTransition(() => {
        setTxOptions(args.txOptions);
        setFee(args.fee);
        const newNode = document.importNode(args.formElement, true);
        newNode.addEventListener("submit", (e) => {
          e.preventDefault();
        });
        setNode(newNode);
      });
      confirmationModal.open();
    },
    [confirmationModal],
  );

  return { requestPost };
};

export default useRequestPost;
