import { css } from "@emotion/react";
import Hr from "components/Hr";
import Modal from "components/Modal";
import SettingsForm from "components/SettingsForm";
import { useScreenClass } from "react-grid-system";
import ReactModal from "react-modal";
import { MOBILE_SCREEN_CLASS, MODAL_CLOSE_TIMEOUT_MS } from "constants/layout";

function SettingsModal({ ...modalProps }: ReactModal.Props) {
  const screenClass = useScreenClass();

  return (
    <Modal
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      overlay={screenClass === MOBILE_SCREEN_CLASS}
      title="Settings"
      hasCloseButton={screenClass === MOBILE_SCREEN_CLASS}
      hasGoBackButton={screenClass !== MOBILE_SCREEN_CLASS}
      onGoBack={modalProps.onRequestClose}
      closeTimeoutMS={
        screenClass !== MOBILE_SCREEN_CLASS ? 0 : MODAL_CLOSE_TIMEOUT_MS
      }
      parentSelector={
        screenClass !== MOBILE_SCREEN_CLASS
          ? () =>
              document.querySelector("#main") ||
              (document.querySelector("#root") as HTMLElement)
          : undefined
      }
      {...modalProps}
    >
      <Hr
        css={css`
          margin-bottom: 20px;
        `}
      />
      <div
        css={css`
          min-height: 340px;
          .${MOBILE_SCREEN_CLASS} & {
            min-height: unset;
          }
        `}
      >
        <SettingsForm />
      </div>
    </Modal>
  );
}

export default SettingsModal;
