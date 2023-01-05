import UnverifiedAssetModal from "components/Modal/UnverifiedAssetModal";
import { MODAL_CLOSE_TIMEOUT_MS } from "constants/layout";
import useGlobalElement from "hooks/useGlobalElement";
import { useModal } from "hooks/useModal";
import { useEffect, useMemo, useState } from "react";

const useUnverifiedAssetModal = () => {
  const modal = useModal();
  const [address, setAddress] = useState("");
  const [onCancelClick, setOnCancelClick] = useState<() => void>();

  const element = useMemo(
    () => (
      <UnverifiedAssetModal
        isOpen={!!address && modal.isOpen}
        onRequestClose={() => modal.close()}
        onCancelClick={onCancelClick}
        address={address}
      />
    ),
    [modal, address, onCancelClick],
  );

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | undefined;
    if (!modal.isOpen) {
      timerId = setTimeout(() => {
        setAddress("");
        setOnCancelClick(undefined);
      }, MODAL_CLOSE_TIMEOUT_MS);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [modal.isOpen]);

  const showModal = (newAddress: string, callback?: () => void) => {
    setAddress(newAddress);
    setOnCancelClick(() => callback);
    modal.open();
  };

  useGlobalElement(element);
  return { showModal };
};

export default useUnverifiedAssetModal;
