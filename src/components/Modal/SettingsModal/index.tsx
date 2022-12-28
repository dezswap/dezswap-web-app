import { css } from "@emotion/react";
import Hr from "components/Hr";
import Modal from "components/Modal";
import SettingsForm from "components/SettingsForm";
import { useScreenClass } from "react-grid-system";
import ReactModal from "react-modal";
import { MOBILE_SCREEN_CLASS } from "constants/layout";

function SettingsModal({ ...modalProps }: ReactModal.Props) {
  const screenClass = useScreenClass();

  return (
    <Modal
      drawer={screenClass === "xs"}
      overlay={screenClass === "xs"}
      title="Settings"
      hasCloseButton={screenClass === "xs"}
      hasGoBackButton={screenClass !== "xs"}
      onGoBack={modalProps.onRequestClose}
      parentSelector={
        screenClass !== "xs"
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
          min-height: 383px;
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
