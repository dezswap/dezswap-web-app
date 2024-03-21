import ConnectWalletModal from "components/Modal/ConnectWalletModal";
import { useMemo } from "react";
import useGlobalElement from "hooks/useGlobalElement";
import useHashModal from "hooks/useHashModal";

const useConnectWalletModal = () => {
  const modal = useHashModal();
  const element = useMemo(
    () => (
      <ConnectWalletModal isOpen={modal.isOpen} onRequestClose={modal.close} />
    ),
    [modal.close, modal.isOpen],
  );
  useGlobalElement(element);
  return modal;
};

export default useConnectWalletModal;
