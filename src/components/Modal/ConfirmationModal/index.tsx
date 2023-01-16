import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Button from "components/Button";
import Modal from "components/Modal";
import { MOBILE_SCREEN_CLASS, MODAL_CLOSE_TIMEOUT_MS } from "constants/layout";
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
  isModalParent: boolean;
}

function ConfirmationModal({
  node,
  onConfirm,
  isModalParent,
  ...modalProps
}: ConfirmationModalProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const screenClass = useScreenClass();
  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerHTML = "";
      if (node) {
        divRef.current.appendChild(node);
        const inputs = divRef.current.getElementsByTagName("input");
        Array.from(inputs).forEach((elInput) => {
          // eslint-disable-next-line no-param-reassign
          elInput.size = elInput.value.length;
        });
      }
    }
  }, [node, modalProps.isOpen]);
  return (
    <Modal
      {...modalProps}
      id="confirm-modal"
      parentSelector={
        screenClass !== MOBILE_SCREEN_CLASS && !isModalParent
          ? () => {
              return (
                document.querySelector("#main") ||
                (document.querySelector("#root") as HTMLElement)
              );
            }
          : undefined
      }
      closeTimeoutMS={
        screenClass !== MOBILE_SCREEN_CLASS ? 0 : MODAL_CLOSE_TIMEOUT_MS
      }
      title="Confirmation"
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      overlay={screenClass === MOBILE_SCREEN_CLASS}
      hasGoBackButton={screenClass !== MOBILE_SCREEN_CLASS}
      hasCloseButton={screenClass === MOBILE_SCREEN_CLASS}
      onGoBack={modalProps.onRequestClose}
    >
      <Content ref={divRef} className="cm" />
      <Button
        block
        size="large"
        variant="primary"
        onClick={async (event) => {
          if (modalProps.onRequestClose) {
            modalProps.onRequestClose(event);
          }
          if (onConfirm) {
            await onConfirm();
          }
        }}
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
        variant="secondary"
        onClick={modalProps.onRequestClose}
      >
        Cancel
      </Button>
    </Modal>
  );
}

export default ConfirmationModal;
