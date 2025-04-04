import { ConnectType, CreateTxFailed, TxResult } from "@xpla/wallet-provider";
import { CreateTxOptions, Fee } from "@xpla/xpla.js";
import { useCallback, useEffect, useState, useTransition } from "react";
import { TxError } from "types/common";
import useConfirmationModal from "./modals/useConfirmationModal";
import useTxBroadcastingModal from "./modals/useTxBroadcastingModal";
import useCosmostationWallet from "./useCosmostationWallet";
import useConnectedWallet from "./useConnectedWallet";

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

  const postTx = useCallback(
    async (createTxOptions: CreateTxOptions) => {
      if (connectedWallet?.availablePost) {
        try {
          txBroadcastModal.open();
          const result = await connectedWallet.post(createTxOptions);
          setTxResult(result);
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

      // Cosmostation
      if (
        connectedWallet?.walletAddress &&
        !connectedWallet?.availablePost &&
        createTxOptions.fee
      ) {
        try {
          txBroadcastModal.open();
          const result = await cosmostationWallet.post(
            createTxOptions,
            createTxOptions.fee,
          );
          setTxResult(result);
        } catch (error) {
          console.log(error);
          if (error instanceof Error) {
            setTxError(error);
          }
        }
      }
    },
    [connectedWallet.walletAddress, cosmostationWallet, txBroadcastModal],
  );

  const handleConfirm = useCallback(async () => {
    if (txOptions) {
      postTx({ ...txOptions, fee: fee ?? txOptions.fee });
    }
  }, [fee, postTx, txOptions]);

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
      fee?: Fee;
      formElement?: HTMLFormElement;
      skipConfirmation?: boolean;
    }) => {
      if (args.skipConfirmation) {
        if (args.txOptions) {
          postTx({ ...args.txOptions, fee: args.fee ?? args.txOptions.fee });
        }
        return;
      }

      startTransition(() => {
        setTxOptions(args.txOptions);
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
