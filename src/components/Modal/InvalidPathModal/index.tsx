import { MouseEventHandler } from "react";
import { css, useTheme } from "@emotion/react";
import Modal from "components/Modal";
import Failed from "assets/images/failed.svg";
import Typography from "components/Typography";
import Panel from "components/Panel";
import Button from "components/Button";
import { useScreenClass } from "react-grid-system";
import { MOBILE_SCREEN_CLASS } from "constants/layout";

interface InvalidPathModalProps {
  onReturnClick?: MouseEventHandler<HTMLButtonElement>;
}

function InvalidPathModal({
  isOpen,
  onReturnClick,
  ...modalProps
}: ReactModal.Props & InvalidPathModalProps) {
  const theme = useTheme();
  const screenClass = useScreenClass();

  return (
    <Modal
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      title="Invalid URL"
      error
      isOpen={isOpen}
      {...modalProps}
    >
      <div
        css={css`
          text-align: center;
        `}
      >
        <object
          type="image/svg+xml"
          data={Failed}
          style={{ height: "170px", margin: "-10px 0px" }}
        >
          error
        </object>
        <Panel
          border
          css={css`
            padding: 16px;
            background-color: ${theme.colors.text.background};
            border-color: ${theme.colors.danger};
          `}
        >
          <Typography
            color={theme.colors.danger}
            weight="bold"
            css={css`
              padding-bottom: 10px;
            `}
          >
            You are accessing with an invalid URL. Please go back and access it properly.
          </Typography>
        </Panel>
        <Button
          size="large"
          variant="error"
          css={css`
            width: 100%;
            margin-top: 20px;
          `}
          onClick={onReturnClick}
        >
          Return
        </Button>
      </div>
    </Modal>
  );
}

export default InvalidPathModal;
