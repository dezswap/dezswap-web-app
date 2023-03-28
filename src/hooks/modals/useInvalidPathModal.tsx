import { useModal } from "hooks/useModal";
import { useMemo } from "react";
import useGlobalElement from "hooks/useGlobalElement";
import InvalidPathModal from "components/Modal/InvalidPathModal";

const useInvalidPathModal = ({
  onReturnClick,
}: {
  onReturnClick: () => void;
}) => {
  const modal = useModal();
  const element = useMemo(
    () => (
      <InvalidPathModal
        isOpen={modal.isOpen}
        onReturnClick={() => {
          if (onReturnClick) {
            onReturnClick();
          } else {
            window.location.reload();
            // modal.close();
          }
        }}
      />
    ),
    [modal.close, modal.isOpen],
  );
  useGlobalElement(element);
  return modal;
};

export default useInvalidPathModal;
