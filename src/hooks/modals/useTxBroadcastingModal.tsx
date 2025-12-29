import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import TxBroadcastingModal from "~/components/Modal/TxBroadcastingModal";

import useConnectedWallet from "~/hooks/useConnectedWallet";
import useGlobalElement from "~/hooks/useGlobalElement";
import useModal from "~/hooks/useModal";

import { TxError } from "~/types/common";

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
  const queryClient = useQueryClient();
  const { walletAddress } = useConnectedWallet();
  const element = useMemo(
    () => (
      <TxBroadcastingModal
        txHash={txHash}
        txError={txError}
        isOpen={modal.isOpen}
        onDoneClick={() => {
          if (onDoneClick) {
            onDoneClick();
            queryClient.invalidateQueries({
              predicate: (query) => {
                const keys = query.queryKey;
                return keys.includes(walletAddress);
              },
            });
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
