import { useCallback, useMemo } from "react";

import FirstProvideModal from "~/components/Modal/FirstProvideModal";

import useGlobalElement from "~/hooks/useGlobalElement";
import useModal from "~/hooks/useModal";

const useFirstProvideModal = ({
  addresses,
  onClickCancel,
}: {
  addresses: [string, string];
  onClickCancel?: () => void;
}) => {
  const modal = useModal();

  const handleClose = useCallback(() => {
    modal.close();

    if (onClickCancel) {
      onClickCancel();
    }
  }, [modal.close, onClickCancel]);

  const element = useMemo(
    () => (
      <FirstProvideModal
        addresses={addresses}
        isOpen={modal.isOpen}
        onRequestClose={handleClose}
      />
    ),
    [handleClose, modal.isOpen],
  );
  useGlobalElement(element);
  return modal;
};

export default useFirstProvideModal;
