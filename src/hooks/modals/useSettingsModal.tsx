import SettingsModal from "components/Modal/SettingsModal";
import useGlobalElement from "hooks/useGlobalElement";
import useHashModal from "hooks/useHashModal";
import { useMemo } from "react";

const useSettingsModal = () => {
  const modal = useHashModal("settings");
  const element = useMemo(
    () => <SettingsModal isOpen={modal.isOpen} onRequestClose={modal.close} />,
    [modal.close, modal.isOpen],
  );
  useGlobalElement(element);
  return modal;
};

export default useSettingsModal;
