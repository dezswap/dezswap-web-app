import ConnectWalletModal from "components/Modal/ConnectWalletModal";
import { useMemo } from "react";
import useGlobalElement from "../useGlobalElement";
import useModal from "../useModal";

const useConnectWalletModal = () => {
  const modal = useModal();
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
