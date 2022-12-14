import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Col, Row } from "react-grid-system";
import ReactModal from "react-modal";
import Modal from "components/Modal";

import { ConnectType, useWallet } from "@xpla/wallet-provider";
import { MouseEventHandler } from "react";
import { isMobile } from "react-device-detect";
import Typography from "components/Typography";

const WalletButton = styled.button`
  width: 100%;
  height: auto;
  position: relative;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: transparent;
  margin: 0;
  padding: 18px 20px;
  font-style: normal;
  font-weight: 600;
  font-size: 13px;
  line-height: 20px;
  text-align: justify;

  cursor: pointer;
`;

WalletButton.defaultProps = {
  type: "button",
};

type WalletButtonProps = {
  label: string;
  iconSrc: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isInstalled?: boolean;
};

function ConnectWalletModal(props: ReactModal.Props) {
  const { availableConnections, availableInstallations } = useWallet();
  const { connect } = useWallet();
  const theme = useTheme();

  const buttons: WalletButtonProps[] = [
    ...availableConnections
      .filter(({ type }) => type !== ConnectType.READONLY)
      .map(
        ({ type, icon, name, identifier }) =>
          ({
            label: name,
            iconSrc: icon,
            isInstalled: true,
            onClick: (event) => {
              if (isMobile) {
                connect(type, identifier, false);
              } else {
                connect(type, identifier);
              }
              if (props.onRequestClose) {
                props.onRequestClose(event);
              }
            },
          } as WalletButtonProps),
      ),
    ...availableInstallations
      .filter(({ type }) => type !== ConnectType.READONLY)
      .map(({ icon, name, url }) => ({
        label: `Install ${name}`,
        iconSrc: icon,
        onClick: () => {
          window.open(url);
        },
      })),
  ];

  return (
    <Modal {...props}>
      <Typography
        color={theme.colors.primary}
        size={20}
        weight={900}
        css={css`
          text-align: center;
          margin-bottom: 25px;
        `}
      >
        Connect to a wallet
      </Typography>
      <div
        css={css`
          width: 100%;
          height: auto;
          position: relative;
          display: flex;
          flex-direction: column;
          row-gap: 8px;
        `}
      >
        {buttons.map((item) => (
          <WalletButton key={item.label} onClick={item.onClick}>
            <Row justify="between" align="center">
              <Col>{item.label}</Col>
              <Col width="auto" css={{ height: 24 }}>
                <div
                  css={css`
                    width: 24px;
                    height: 24px;
                    position: relative;
                    display: inline-block;
                    background-size: contain;
                    background-position: 50% 50%;
                    background-repeat: no-repeat;
                    background-image: url(${item.iconSrc});
                  `}
                />
              </Col>
            </Row>
          </WalletButton>
        ))}
      </div>
    </Modal>
  );
}

export default ConnectWalletModal;
