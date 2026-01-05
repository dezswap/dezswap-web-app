import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { WalletState } from "@interchain-kit/core";
import { useWalletManager } from "@interchain-kit/react";
import { isMobile } from "@xpla/wallet-controller/utils/browser-check";
import { ConnectType, useWallet } from "@xpla/wallet-provider";
import React, {
  type ComponentProps,
  MouseEventHandler,
  useEffect,
  useState,
} from "react";
import { Col, Row, useScreenClass } from "react-grid-system";
import ReactModal from "react-modal";
import QRCode from "react-qr-code";

import iconInstall from "~/assets/icons/icon-install.svg";
import iconInstalled from "~/assets/icons/icon-installed.svg";

import Box from "~/components/Box";
import Hr from "~/components/Hr";
import Modal from "~/components/Modal";
import Typography from "~/components/Typography";

import { UNSUPPORT_WALLET_LIST } from "~/constants/dezswap";
import { MOBILE_SCREEN_CLASS } from "~/constants/layout";

import useNetwork from "~/hooks/useNetwork";

const StyledWalletButton = styled.button`
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

function WalletButton({
  type = "button",
  ...props
}: ComponentProps<typeof StyledWalletButton>) {
  return <StyledWalletButton type={type} {...props} />;
}

type WalletButtonProps = {
  label: string;
  iconSrc: string;
  key: string;
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

function QrModalContent({ uri }: { uri: string }) {
  const theme = useTheme();

  return (
    <Box
      style={{
        marginTop: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography color={theme.colors.primary} size={16} weight={400}>
        Please scan the QR code below with your wallet to connect with Dezswap.
      </Typography>
      <div
        style={{
          padding: "24px",
          background: "white",
          display: "inline-block",
          margin: "30px 0 12px",
          alignSelf: "center",
        }}
      >
        <QRCode
          value={uri}
          fgColor={theme.colors.primary}
          bgColor="white"
          style={{ textAlign: "center", width: "127px", height: "127px" }}
        />
      </div>
    </Box>
  );
}

function ConnectWalletModal(props: ReactModal.Props) {
  const { availableConnections, availableInstallations } = useWallet();
  const { connect } = useWallet();
  const { chainName } = useNetwork();
  const theme = useTheme();
  const screenClass = useScreenClass();
  const wm = useWalletManager();
  const [wcUri, setWcUri] = useState("");

  useEffect(() => {
    if (wm?.walletConnectQRCodeUri) {
      setWcUri(wm?.walletConnectQRCodeUri);
    }
  }, [wm?.walletConnectQRCodeUri]);

  const buttons: WalletButtonProps[] = [
    ...availableConnections
      .filter(({ type }) => type !== ConnectType.READONLY)
      .map(({ type, icon, name, identifier }) => ({
        label: name,
        identifier,
        type,
        iconSrc: icon,
        isInstalled: true,
        key: `xpla-${name}`,
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
              p satisfies WalletButtonProps,
              {
                label: `${p.label}\n(XPLA GAMES)`,
                iconSrc: p.iconSrc,
                isInstalled: true,
                key: `${p.label}\n(XPLA GAMES)`,
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
              } satisfies WalletButtonProps,
            ]
          : (p satisfies WalletButtonProps),
      ),
    ...wm.wallets
      .filter(
        (wallet) =>
          !UNSUPPORT_WALLET_LIST[chainName].includes(wallet.info.name),
      )
      .map((wallet) => {
        const isInstalled = wallet.walletState !== WalletState.NotExist;
        const iconSrc =
          typeof wallet.info.logo === "string"
            ? wallet.info.logo
            : (wallet.info.logo?.major ?? "");

        return {
          label: wallet.info.prettyName,
          iconSrc,
          isInstalled,
          key: `interchain-${wallet.info.name}`,
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
        } satisfies WalletButtonProps;
      }),
    ...availableInstallations
      .filter(({ type }) => type !== ConnectType.READONLY)
      .map(({ icon, name, url }) => ({
        label: `${name}`,
        iconSrc: icon,
        key: `xpla-${name}-install`,
        onClick: () => {
          window.open(url);
        },
      })),
  ];

  return (
    <Modal
      drawer={screenClass === MOBILE_SCREEN_CLASS}
      hasCloseButton
      // TODO: Wallet Connect -> WalletConnect
      title={wcUri ? "Wallet Connect" : "Connect to a wallet"}
      hasGoBackButton={!!wcUri}
      onGoBack={() => {
        return setWcUri("");
      }}
      onAfterClose={() => {
        return setWcUri("");
      }}
      {...props}
    >
      <Hr size={1} />
      {wcUri ? (
        <QrModalContent uri={wcUri} />
      ) : (
        <>
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
            Disclaimer. Wallets are provided by third parties. By connecting
            your wallet is considered that you agree to their terms and
            conditions. Always trade at your own risk.
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
                key={item.key}
                style={{
                  marginTop:
                    screenClass === MOBILE_SCREEN_CLASS ? "15px" : "20px",
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
        </>
      )}
    </Modal>
  );
}

export default ConnectWalletModal;
