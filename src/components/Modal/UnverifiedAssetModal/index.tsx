import imgFailed from "assets/images/failed.svg";
import { Col, Row, useScreenClass } from "react-grid-system";
import Modal from "components/Modal";
import Panel from "components/Panel";
import { css } from "@emotion/react";
import Button from "components/Button";
import Hr from "components/Hr";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import theme from "styles/theme";
import IconButton from "components/IconButton";
import iconLink from "assets/icons/icon-link-danger.svg";
import { ellipsisCenter, getWalletLink } from "utils";
import { useNetwork } from "hooks/useNetwork";

interface UnverifiedAssetModalProps extends ReactModal.Props {
  address?: string;
  onCancelClick?: () => void;
}

function UnverifiedAssetModal({
  isOpen,
  address,
  onCancelClick,
  ...modalProps
}: UnverifiedAssetModalProps) {
  const screenClass = useScreenClass();
  const network = useNetwork();
  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      error
      title="Warning"
      {...modalProps}
    >
      <div
        css={css`
          text-align: center;
        `}
      >
        <object
          type="image/svg+xml"
          data={imgFailed}
          style={{ height: "170px", margin: "-10px 0px" }}
        >
          warning
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
            Check the token address
          </Typography>
          <Hr color="danger" size={1} />
          <Typography
            size={16}
            color={theme.colors.danger}
            weight="normal"
            css={css`
              padding-top: 10px;
              padding-bottom: 9px;
            `}
          >
            This token isn’t swapped frequently on Dezswap. Please check the
            token address and conduct your own risk.
          </Typography>
          <Hr
            color="danger"
            size={1}
            css={css`
              margin-bottom: 10px;
            `}
          />
          <Row wrap="nowrap" align="center" justify="between">
            <Col width="auto">
              <Typography size={14} weight={500}>
                Address
              </Typography>
            </Col>
            <Col>
              <a
                href={getWalletLink(address, network.name)}
                target="_blank"
                rel="noreferrer"
                css={css`
                  text-decoration: none;
                `}
              >
                <Row
                  gutterWidth={10}
                  align="end"
                  style={{
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Col>
                    <Typography
                      size={16}
                      weight="bold"
                      color={theme.colors.link}
                      css={css`
                        text-decoration: underline;
                        text-underline-offset: 3px;
                        word-break: break-all;
                        text-align: right;
                      `}
                    >
                      {ellipsisCenter(address, 6)}
                    </Typography>
                  </Col>
                  <Col width="auto" style={{ flexShrink: "0" }}>
                    <IconButton size={24} icons={{ default: iconLink }} />
                  </Col>
                </Row>
              </a>
            </Col>
          </Row>
        </Panel>
        <Button
          block
          size="large"
          variant="error"
          css={css`
            margin-top: 20px;
          `}
          onClick={modalProps.onRequestClose}
        >
          I understand
        </Button>
        <Button
          block
          size="large"
          variant="secondary"
          css={css`
            margin-top: 10px;
          `}
          onClick={(event) => {
            if (onCancelClick) {
              onCancelClick();
            }
            if (modalProps.onRequestClose) {
              modalProps.onRequestClose(event);
            }
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default UnverifiedAssetModal;
