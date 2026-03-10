import { css } from "@emotion/react";
import { useScreenClass } from "react-grid-system";
import ReactModal from "react-modal";

import Hr from "~/components/Hr";
import Modal from "~/components/Modal";
import SettingsForm, { SettingsFormProps } from "~/components/SettingsForm";

import {
  MOBILE_SCREEN_CLASS,
  MODAL_CLOSE_TIMEOUT_MS,
} from "~/constants/layout";

function SettingsModal({
  items,
  ...modalProps
}: ReactModal.Props & SettingsFormProps) {
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
        screenClass !== MOBILE_SCREEN_CLASS &&
        document.querySelector(".modal-parent")
          ? () =>
              document.querySelector(".modal-parent") ||
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
          min-height: 324px;
          .${MOBILE_SCREEN_CLASS} & {
            min-height: 200px;
          }
        `}
      >
        <SettingsForm items={items} />
      </div>
    </Modal>
  );
}

export default SettingsModal;
