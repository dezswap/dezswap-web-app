import { useMemo } from "react";
import FirstProvideModal from "components/Modal/FirstProvideModal";
import useGlobalElement from "hooks/useGlobalElement";
import { useModal } from "hooks/useModal";

const useFirstProvideModal = ({
  addresses,
}: {
  addresses: [string, string];
}) => {
  const modal = useModal();
  const element = useMemo(
    () => (
      <FirstProvideModal
        addresses={addresses}
        isOpen={modal.isOpen}
        onRequestClose={modal.close}
      />
    ),
    [modal.close, modal.isOpen],
  );
  useGlobalElement(element);
  return modal;
};

export default useFirstProvideModal;
