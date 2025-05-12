import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Col, Row, useScreenClass } from "react-grid-system";
import ReactModal from "react-modal";
import Modal from "components/Modal";

import { ConnectType, useWallet } from "@xpla/wallet-provider";
import React, { MouseEventHandler } from "react";
import Typography from "components/Typography";
import Hr from "components/Hr";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import iconInstall from "assets/icons/icon-install.svg";
import iconInstalled from "assets/icons/icon-installed.svg";
import { isMobile } from "@xpla/wallet-controller/utils/browser-check";
import { useWalletManager } from "@interchain-kit/react";
import useNetwork from "hooks/useNetwork";
import { BaseWallet, WalletState } from "@interchain-kit/core";
import { UNSUPPORT_WALLET_LIST } from "constants/dezswap";

const WalletButton = styled.button`
  width: auto;
  height: 89px;
  position: relative;
  background-color: transparent;
  margin: 0;
  border: none;
  font-style: normal;
  font-weight: 600;
  font-size: 13px;
  text-align: center;

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

const { userAgent } = navigator;

const getBrowser = () => {
  if (/Chrome/.test(userAgent) && !/Edge|Edg|OPR/.test(userAgent)) {
    return "chrome";
  }
  if (/Firefox/.test(userAgent)) {
    return "firefox";
  }
  return undefined;
};
const browserType = getBrowser();

function ConnectWalletModal(props: ReactModal.Props) {
  const { availableConnections, availableInstallations } = useWallet();
  const { connect } = useWallet();
  const { chainName } = useNetwork();
  const theme = useTheme();
  const screenClass = useScreenClass();
  const wm = useWalletManager();

  const buttons: WalletButtonProps[] = [
    ...availableConnections
      .filter(({ type }) => type !== ConnectType.READONLY)
      .map(({ type, icon, name, identifier }) => ({
        label: name,
        identifier,
        type,
        iconSrc: icon,
        isInstalled: true,
        onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          connect(type, identifier, false);
          if (props.onRequestClose) {
            props.onRequestClose(event);
          }
        },
      }))
      .flatMap((p) =>
        isMobile() && p.label === "Wallet Connect"
          ? [
              p as WalletButtonProps,
              {
                label: `${p.label}\n(XPLA GAMES)`,
                iconSrc: p.iconSrc,
                isInstalled: true,
                onClick: (event) => {
                  try {
                    connect(p.type, p.identifier, true);
                  } catch (error) {
                    console.log(error);
                  }

                  if (props.onRequestClose) {
                    props.onRequestClose(event);
                  }
                },
              } as WalletButtonProps,
            ]
          : (p as WalletButtonProps),
      ),
    ...wm.wallets
      .filter(
        (wallet: BaseWallet) =>
          !isMobile() &&
          !UNSUPPORT_WALLET_LIST[chainName].includes(wallet.info.name),
      )
      .map((wallet: BaseWallet) => {
        const isInstalled = wallet.walletState !== WalletState.NotExist;

        const iconSrc =
          typeof wallet.info.logo === "string"
            ? wallet.info.logo
            : wallet.info.logo?.major ?? "";

        return {
          label: wallet.info.prettyName,
          iconSrc,
          isInstalled,
          onClick: async (event) => {
            try {
              if (!isInstalled) {
                const url = wallet.info.downloads?.find(
                  (d) => d.browser === browserType,
                )?.link;
                if (url) window.open(url);
              }

              await wm.connect(wallet.info.name, chainName);

              if (props.onRequestClose) {
                props.onRequestClose(event);
              }
            } catch (error) {
              console.log(error);
            }
          },
        } as WalletButtonProps;
      }),
    ...availableInstallations
      .filter(({ type }) => type !== ConnectType.READONLY)
      .map(({ icon, name, url }) => ({
        label: `${name}`,
        iconSrc: icon,
        onClick: () => {
          window.open(url);
        },
      })),
  ];

  return (
    <Modal
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      hasCloseButton
      title="Connect to a wallet"
      {...props}
    >
      <Hr size={1} />
      <Typography
        color={theme.colors.primary}
        size={16}
        weight="normal"
        css={css`
          padding-top: 20px;
          padding-bottom: ${screenClass === MOBILE_SCREEN_CLASS
            ? "15px"
            : "0px"};
        `}
      >
        By connecting a wallet, you understand and agree to Dezswap’s
        Disclaimer. Wallets are provided by third parties. By connecting your
        wallet is considered that you agree to their terms and conditions.
        Always trade at your own risk.
      </Typography>
      <Row
        gutterWidth={0}
        style={{
          flexWrap: "wrap",
          height: "100%",
        }}
      >
        {buttons.map((item) => (
          <Col
            xs={6}
            sm={4}
            key={item.label}
            style={{
              marginTop: screenClass === MOBILE_SCREEN_CLASS ? "15px" : "20px",
              marginBottom:
                screenClass === MOBILE_SCREEN_CLASS ? "15px" : "0px",
              textAlign: "center",
            }}
          >
            <WalletButton
              onClick={item.onClick}
              style={{ height: "max-content" }}
            >
              <Row direction="column">
                <Col style={{ minHeight: "60px", marginBottom: "10px" }}>
                  <div
                    css={css`
                      width: 60px;
                      height: 60px;
                      display: inline-block;
                      background-size: contain;
                      background-position: 50% 50%;
                      background-repeat: no-repeat;
                      background-image: url(${item.iconSrc});
                      text-align: right;

                      &:hover::before {
                        content: "";
                        position: absolute;
                        top: 0px;
                        right: 0px;
                        bottom: 0px;
                        left: 0px;
                        background-color: rgba(255, 255, 255, 0.3);
                      }
                    `}
                  >
                    <div
                      css={css`
                        position: relative;
                        width: 60px;
                        height: 60px;
                        display: inline-block;
                        background-size: 22px 22px;
                        background-repeat: no-repeat;
                        background-position: bottom right;
                        background-image: url(${item.isInstalled
                          ? iconInstalled
                          : iconInstall});
                      `}
                    />
                  </div>
                </Col>
                <Col style={{ minHeight: "max-content" }}>
                  <Typography
                    color={theme.colors.primary}
                    weight={900}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {item.label}
                  </Typography>
                </Col>
              </Row>
            </WalletButton>
          </Col>
        ))}
      </Row>
    </Modal>
  );
}

export default ConnectWalletModal;
