import { useScreenClass } from "react-grid-system";
import ReactModal from "react-modal";

import iconSettingHover from "~/assets/icons/icon-setting-hover.svg";
import iconSetting from "~/assets/icons/icon-setting.svg";

import IconButton from "~/components/IconButton";
import Modal from "~/components/Modal";

import { MOBILE_SCREEN_CLASS } from "~/constants/layout";

import useSettingsModal from "~/hooks/modals/useSettingsModal";
import { useNavigate } from "~/hooks/useNavigate";

import SwapPage from "~/pages/Trade/Swap";

function SwapModal(props: ReactModal.Props) {
  const navigate = useNavigate();
  const screenClass = useScreenClass();
  const settingsModal = useSettingsModal();

  const {
    onRequestClose = () => {
      navigate("..", { replace: true, relative: "route" });
    },
    ...modalProps
  } = props;

  return (
    <Modal
      id="swap-modal"
      className="modal-parent"
      title="Swap"
      hasCloseButton
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      onRequestClose={onRequestClose}
      headerExtra={
        <IconButton
          size={38}
          icons={{ default: iconSetting, hover: iconSettingHover }}
          onClick={() => settingsModal.open()}
        />
      }
      {...modalProps}
    >
      <SwapPage />
    </Modal>
  );
}

export default SwapModal;
