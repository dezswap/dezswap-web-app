import ReactModal from "react-modal";
import { useScreenClass } from "react-grid-system";
import { useNavigate } from "react-router-dom";
import SwapPage from "pages/Trade/Swap";
import IconButton from "components/IconButton";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import useSettingsModal from "hooks/modals/useSettingsModal";
import Modal from "components/Modal";

import iconSetting from "assets/icons/icon-setting.svg";
import iconSettingHover from "assets/icons/icon-setting-hover.svg";

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
