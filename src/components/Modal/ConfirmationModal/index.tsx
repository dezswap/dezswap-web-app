import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Button from "components/Button";
import Modal from "components/Modal";
import { useEffect, useRef } from "react";
import { useScreenClass } from "react-grid-system";

const Content = styled.div`
  pointer-events: none;
  & button[type="submit"] {
    display: none;
  }
  & .cm-hidden {
    display: none;
  }
`;

interface ConfirmationModalProps extends Omit<ReactModal.Props, "children"> {
  node?: Node;
  onConfirm?(): void;
}

function ConfirmationModal({
  node,
  onConfirm,
  ...modalProps
}: ConfirmationModalProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const screenClass = useScreenClass();
  useEffect(() => {
    if (node && modalProps.isOpen) {
      setTimeout(() => {
        if (divRef.current) {
          divRef.current.innerHTML = "";
          divRef.current.appendChild(node);
          const inputs = divRef.current.getElementsByTagName("input");
          Array.from(inputs).forEach((elInput) => {
            // eslint-disable-next-line no-param-reassign
            elInput.size = elInput.value.length;
          });
        }
      }, 100);
    }
  }, [node, modalProps.isOpen]);
  return (
    <Modal
      {...modalProps}
      title="Confirmation"
      drawer={screenClass === "xs"}
      overlay={screenClass === "xs"}
      hasGoBackButton={screenClass !== "xs"}
      hasCloseButton={screenClass === "xs"}
      onGoBack={modalProps.onRequestClose}
    >
      <Content ref={divRef} className="cm" />
      <Button
        block
        size="large"
        variant="primary"
        onClick={() => onConfirm && onConfirm()}
        css={css`
          margin-top: 10px;
          margin-bottom: 10px;
        `}
      >
        Confirm
      </Button>
      <Button
        block
        size="large"
        variant="default"
        onClick={modalProps.onRequestClose}
      >
        Cancel
      </Button>
    </Modal>
  );
}

export default ConfirmationModal;
