import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Button from "components/Button";
import Modal from "components/Modal";
import { MOBILE_SCREEN_CLASS, MODAL_CLOSE_TIMEOUT_MS } from "constants/layout";
import { useEffect, useRef, useState } from "react";
import { useScreenClass } from "react-grid-system";

const Content = styled.div`
  & button[type="submit"] {
    display: none;
  }
  & .cm-hidden {
    display: none;
  }
  pointer-events: none;
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

  const [contentHTML, setContentHTML] = useState("");

  useEffect(() => {
    if (node) {
      const elDiv = document.createElement("div");
      elDiv.appendChild(node);
      const inputs = elDiv.getElementsByTagName("input");
      Array.from(inputs).forEach((elInput) => {
        // eslint-disable-next-line no-param-reassign
        elInput.size = elInput.value.length;
        elInput.setAttribute("value", elInput.value);
      });
      setContentHTML(elDiv.innerHTML);
    }
  }, [node]);

  return (
    <Modal
      {...modalProps}
      id="confirm-modal"
      parentSelector={
        screenClass !== MOBILE_SCREEN_CLASS &&
        !isModalParent &&
        document.querySelector(".modal-parent")
          ? () => {
              return (
                document.querySelector(".modal-parent") ||
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
      <Content
        ref={divRef}
        className="cm"
        dangerouslySetInnerHTML={{ __html: contentHTML }}
      />
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
