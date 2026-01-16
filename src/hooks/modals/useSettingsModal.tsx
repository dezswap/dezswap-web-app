import { useMemo, useState } from "react";

import SettingsModal from "~/components/Modal/SettingsModal";
import { SettingsFormProps } from "~/components/SettingsForm";

import useGlobalElement from "~/hooks/useGlobalElement";
import useHashModal from "~/hooks/useHashModal";

const useSettingsModal = (_options?: SettingsFormProps) => {
  const modal = useHashModal("settings");
  const [options] = useState(_options);
  const element = useMemo(
    () => (
      <SettingsModal
        isOpen={modal.isOpen}
        onRequestClose={modal.close}
        items={options?.items}
      />
    ),
    [modal.close, modal.isOpen, options],
  );
  useGlobalElement(element);
  return modal;
};

export default useSettingsModal;
