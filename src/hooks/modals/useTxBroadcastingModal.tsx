import TxBroadcastingModal from "components/Modal/TxBroadcastingModal";
import useGlobalElement from "hooks/useGlobalElement";
import { useModal } from "hooks/useModal";
import { useMemo } from "react";
import { TxError } from "types/common";

const useTxBroadcastingModal = ({
  txHash,
  txError,
}: {
  txHash?: string;
  txError?: TxError;
}) => {
  const modal = useModal();
  const element = useMemo(
    () => (
      <TxBroadcastingModal
        txHash={txHash}
        txError={txError}
        isOpen={modal.isOpen}
        onDoneClick={() => window.location.reload()}
        onRetryClick={modal.close}
      />
    ),
    [modal.close, modal.isOpen, txError, txHash],
  );
  useGlobalElement(element);
  return modal;
};

export default useTxBroadcastingModal;
