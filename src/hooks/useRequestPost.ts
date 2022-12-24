import { TxResult, useConnectedWallet } from "@xpla/wallet-provider";
import { CreateTxOptions, Fee } from "@xpla/xpla.js";
import { useCallback, useEffect, useState, useTransition } from "react";
import { TxError } from "types/common";
import useConfirmationModal from "./modals/useConfirmationModal";
import useTxBroadcastingModal from "./modals/useTxBroadcastingModal";

const useRequestPost = () => {
  const connectedWallet = useConnectedWallet();
  const [txOptions, setTxOptions] = useState<CreateTxOptions>();

  const [txResult, setTxResult] = useState<TxResult>();
  const [txError, setTxError] = useState<TxError>();
  const txBroadcastModal = useTxBroadcastingModal({
    txHash: txResult?.result.txhash,
    txError,
  });

  const [fee, setFee] = useState<Fee>();
  const handleConfirm = useCallback(async () => {
    if (txOptions && fee && connectedWallet?.availablePost) {
      try {
        const result = await connectedWallet.post({
          ...txOptions,
          fee,
        });
        setTxResult(result);
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          setTxError(error);
        }
      }
      txBroadcastModal.open();
    }
  }, [connectedWallet, fee, txOptions, txBroadcastModal]);
  const [formElement, setFormElement] = useState<HTMLFormElement>();

  const [node, setNode] = useState<Node>();
  const confirmationModal = useConfirmationModal({
    node,
    onConfirm: handleConfirm,
  });

  useEffect(() => {
    if (formElement) {
      const newNode = document.importNode(formElement, true);
      newNode.addEventListener("submit", (e) => {
        e.preventDefault();
      });
      setNode(newNode);
    }
  }, [formElement]);

  const [, startTransition] = useTransition();

  const requestPost = async (args: {
    txOptions: CreateTxOptions;
    fee: Fee;
    formElement: HTMLFormElement;
  }) => {
    startTransition(() => {
      setTxOptions(args.txOptions);
      setFee(args.fee);
      setFormElement(args.formElement);
      confirmationModal.open();
    });
  };

  return { requestPost };
};

export default useRequestPost;
