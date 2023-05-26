import ConfirmationModal from "components/Modal/ConfirmationModal";
import useGlobalElement from "hooks/useGlobalElement";
import useModal from "hooks/useModal";
import { useMemo } from "react";

const useConfirmationModal = ({
  node,
  onConfirm,
  isModalParent,
  onClose,
}: {
  node?: Node;
  onConfirm?(): void;
  onClose?(): void;
  isModalParent: boolean;
}) => {
  const modal = useModal();

  const element = useMemo(
    () => (
      <ConfirmationModal
        isOpen={modal.isOpen}
        onRequestClose={() => {
          if (onClose) {
            onClose();
          }
          modal.close();
        }}
        node={node}
        onConfirm={onConfirm}
        isModalParent={isModalParent}
      />
    ),
    [modal, node, onConfirm],
  );

  useGlobalElement(element);
  return modal;
};

export default useConfirmationModal;
