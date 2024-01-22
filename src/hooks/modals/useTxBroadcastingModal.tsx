import TxBroadcastingModal from "components/Modal/TxBroadcastingModal";
import useGlobalElement from "hooks/useGlobalElement";
import useModal from "hooks/useModal";
import { useMemo } from "react";
import { TxError } from "types/common";

const useTxBroadcastingModal = ({
  txHash,
  txError,
  onDoneClick,
}: {
  txHash?: string;
  txError?: TxError;
  onDoneClick?: () => void;
}) => {
  const modal = useModal();
  const element = useMemo(
    () => (
      <TxBroadcastingModal
        txHash={txHash}
        txError={txError}
        isOpen={modal.isOpen}
        onDoneClick={() => {
          if (onDoneClick) {
            onDoneClick();
          } else {
            window.location.reload();
          }
        }}
        onRetryClick={modal.close}
      />
    ),
    [modal.close, modal.isOpen, txError, txHash],
  );
  useGlobalElement(element);
  return modal;
};

export default useTxBroadcastingModal;
