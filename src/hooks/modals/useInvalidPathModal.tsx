import { useMemo } from "react";

import InvalidPathModal from "~/components/Modal/InvalidPathModal";

import useGlobalElement from "~/hooks/useGlobalElement";
import useModal from "~/hooks/useModal";

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
