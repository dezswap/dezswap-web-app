import { css, useTheme } from "@emotion/react";

import FirstProvide from "assets/images/be_the_first.svg";
import Panel from "components/Panel";
import Modal from "components/Modal";
import Typography from "components/Typography";
import { useScreenClass } from "react-grid-system";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import Button from "components/Button";
import ReactModal from "react-modal";
import { Link } from "react-router-dom";
import { convertIbcTokenAddressForPath } from "utils";

interface FirstProvideModalProps {
  addresses?: [string, string];
}

function FirstProvideModal({
  addresses,
  ...props
}: FirstProvideModalProps & ReactModal.Props) {
  const theme = useTheme();
  const screenClass = useScreenClass();

  return (
    <Modal
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      title="Non-existent pool"
      gradient
      {...props}
    >
      <div
        css={css`
          text-align: center;
        `}
      >
        <object
          type="image/svg+xml"
          data={FirstProvide}
          style={{ height: "170px", margin: "-10px 0px" }}
        >
          broadcasting
        </object>
        <Panel
          style={{
            backgroundImage: `linear-gradient(#fff, #fff), ${theme.colors.gradient}`,
            borderImageSlice: 1,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            border: "3px solid transparent",
          }}
          css={css`
            padding: 16px;
          `}
        >
          <Typography size={16} weight="normal">
            The selected pair doesn&apos;t have a pool. You can create the pool
            as a first!
          </Typography>
        </Panel>
        <Link
          to={`/pool/create/${addresses
            ?.map((a) => convertIbcTokenAddressForPath(a))
            .join("/")}`}
          css={css`
            text-decoration: none;
          `}
        >
          <Button
            size="large"
            variant="gradient"
            css={css`
              width: 100%;
              margin-top: 20px;
              border: none;
            `}
          >
            Create a new pool
          </Button>
        </Link>
        <Button
          size="large"
          variant="secondary"
          css={css`
            width: 100%;
            margin-top: 10px;
          `}
          onClick={props.onRequestClose}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default FirstProvideModal;
