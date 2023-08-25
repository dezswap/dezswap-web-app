import { useEffect, useMemo, useRef } from "react";
import styled from "@emotion/styled";
import { Col, Container, Row, useScreenClass } from "react-grid-system";

import imgLogo from "assets/images/logo.svg";
import imgSymbol from "assets/images/symbol.svg";
import iconNotification from "assets/icons/icon-noti-off.svg";
import iconNotificationHover from "assets/icons/icon-noti-off-hover.svg";
import iconNotificationWithBadge from "assets/icons/icon-noti-on.svg";
import iconNotificationWithBadgeHover from "assets/icons/icon-noti-on-hover.svg";
import Button from "components/Button";
import IconButton from "components/IconButton";
import NavBar from "components/NavBar";
import Typography from "components/Typography";
import {
  DISPLAY_DECIMAL,
  LARGE_BROWSER_SCREEN_CLASS,
  MOBILE_SCREEN_CLASS,
  SMALL_BROWSER_SCREEN_CLASS,
  TABLET_SCREEN_CLASS,
} from "constants/layout";
import useModal from "hooks/useModal";
import { useConnectedWallet, useWallet } from "@xpla/wallet-provider";
import {
  amountToValue,
  cutDecimal,
  ellipsisCenter,
  formatNumber,
  getAddressLink,
} from "utils";
import useBalance from "hooks/useBalance";
import { XPLA_ADDRESS, XPLA_SYMBOL } from "constants/network";
import iconDropdown from "assets/icons/icon-dropdown-arrow.svg";
import iconXpla from "assets/icons/icon-xpla-24px.svg";
import iconLink from "assets/icons/icon-link.svg";
import { Popover } from "react-tiny-popover";
import Panel from "components/Panel";
import { css, useTheme } from "@emotion/react";
import Hr from "components/Hr";
import useNetwork from "hooks/useNetwork";
import Box from "components/Box";
import Modal from "components/Modal";
import Copy from "components/Copy";
import Banner from "components/Banner";
import useConnectWalletModal from "hooks/modals/useConnectWalletModal";
import Tooltip from "components/Tooltip";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar/dist";

export const DEFAULT_HEADER_HEIGHT = 150;
export const SCROLLED_HEADER_HEIGHT = 77;
export const MOBILE_HEADER_HEIGHT = 65;
export const BANNER_HEIGHT = 31;

interface WrapperProps {
  isTestnet?: boolean;
}

const Wrapper = styled.header<WrapperProps>`
  width: 100%;
  height: ${`${DEFAULT_HEADER_HEIGHT}px`};
  position: sticky;
  left: 0;
  z-index: 5000;

  .${MOBILE_SCREEN_CLASS} & {
    height: ${`${MOBILE_HEADER_HEIGHT}px`};
  }

  ${({ isTestnet = false }) =>
    isTestnet
      ? css`
          top: ${`${BANNER_HEIGHT}px`};
        `
      : css`
          top: 0;
        `}

  & > div {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding-top: 16px;
    padding-bottom: 24px;
    backdrop-filter: blur(4px);

    .${MOBILE_SCREEN_CLASS} & {
      padding-top: 10px;
      padding-bottom: 10px;
    }

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: ${({ theme }) => theme.colors.background};
      opacity: 0.8;
      pointer-events: none;
    }
  }
  &.scrolled > div {
    padding-bottom: 16px;

    .${MOBILE_SCREEN_CLASS} & {
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }
`;

const Logo = styled.div`
  width: 170px;
  height: 110px;
  background-image: url(${imgLogo});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 0% 0%;
  position: relative;
  transition: all 0.2s cubic-bezier(0, 1, 0, 1);

  .scrolled &,
  .${MOBILE_SCREEN_CLASS} & {
    height: 45px;
    background-image: url(${imgSymbol});
  }

  .${MOBILE_SCREEN_CLASS} & {
    width: 40px;
  }
`;

const NavBarWrapper = styled.div`
  display: block;
  width: 100%;
  height: auto;
  max-width: 293px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const navLinks = [
  {
    path: "/",
    label: "Overview",
    disabled: true,
  },
  {
    path: "/trade",
    label: "Trade",
  },
  {
    path: "/earn",
    label: "Earn",
    children: [
      {
        path: "/earn/pools",
        label: "Pools",
      },
      {
        path: "/earn/lockdrop",
        label: "LP Lock&Drop",
      },
    ],
  },
];

function WalletInfo({
  title,
  isOpen,
  onGoBack,
  children,
  connectButton,
}: {
  title: string;
  isOpen: boolean;
  onGoBack?(): void;
  children: JSX.Element;
  connectButton: JSX.Element;
}) {
  const screenClass = useScreenClass();
  const theme = useTheme();

  return screenClass === MOBILE_SCREEN_CLASS ? (
    <>
      {connectButton}
      <Modal
        drawer
        isOpen={isOpen}
        onGoBack={onGoBack}
        onRequestClose={onGoBack}
        title={title}
        hasCloseButton
      >
        {children}
      </Modal>
    </>
  ) : (
    <Popover
      positions={["bottom", "left"]}
      onClickOutside={onGoBack}
      containerStyle={{ zIndex: "6000" }}
      align="end"
      isOpen={isOpen}
      content={
        <Panel
          shadow
          wrapperStyle={{
            paddingRight: "0px",
            paddingBottom: "0px",
          }}
          css={css`
            width: 281px;
            margin-top: 6px;
            padding: 16px;
          `}
        >
          <Typography
            color={theme.colors.primary}
            weight={900}
            css={css`
              text-align: center;
              padding-bottom: 9px;
            `}
          >
            My Wallet
          </Typography>
          {children}
        </Panel>
      }
    >
      {connectButton}
    </Popover>
  );
}

function Header() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const screenClass = useScreenClass();
  const wallet = useWallet();
  const connectedWallet = useConnectedWallet();
  const balance = useBalance(XPLA_ADDRESS);
  const walletPopover = useModal();
  const theme = useTheme();
  const network = useNetwork();
  const connectWalletModal = useConnectWalletModal();
  const isTestnet = useMemo(() => network.name !== "mainnet", [network.name]);

  useEffect(() => {
    const handleScroll = (event?: Event) => {
      const { current } = wrapperRef;
      if (!current) return;
      const scrollY = event?.target
        ? (event?.target as HTMLElement).scrollTop
        : window.scrollY;
      current.classList.toggle("scrolled", scrollY > 0);
    };
    handleScroll();
    const simpleBar = SimpleBar.instances.get(document.body);
    simpleBar.getScrollElement().addEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleScroll);
    return () => {
      simpleBar.getScrollElement().removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {isTestnet && (
        <Banner
          css={css`
            padding: 0;
            position: sticky;
            left: 0;
            top: 0;
            z-index: 6000;
          `}
        >
          <span
            css={css`
              font-style: normal;
              font-weight: 900;
              font-size: 14px;
              line-height: ${BANNER_HEIGHT}px;
              text-transform: uppercase;
            `}
          >
            {connectedWallet?.network.name}
          </span>
        </Banner>
      )}
      <Wrapper ref={wrapperRef} isTestnet={isTestnet}>
        <div>
          <Container>
            <Row justify="between" align="center" gutterWidth={10}>
              <Col xs="content">
                <Link to="/">
                  <Logo />
                </Link>
              </Col>
              {[
                SMALL_BROWSER_SCREEN_CLASS,
                LARGE_BROWSER_SCREEN_CLASS,
              ].includes(screenClass) && (
                <NavBarWrapper>
                  <NavBar
                    items={navLinks.map((item) => ({
                      key: item.path,
                      to: item.path,
                      disabled: item.disabled,
                      css: css`
                        .sub-menu {
                          display: none;
                        }
                        &:hover {
                          .sub-menu {
                            display: block;
                          }
                        }
                      `,
                      children: item.disabled ? (
                        <Tooltip content="Coming soon">
                          <Typography size={18} weight={900} color="primary">
                            {item.label}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography size={18} weight={900} color="primary">
                          {item.label}
                          {item.children && (
                            <div
                              className="sub-menu"
                              css={css`
                                position: absolute;
                                padding-top: 3px;
                                left: 50%;
                                z-index: 6000;
                                transform: translateX(-50%);
                                top: 100%;
                              `}
                            >
                              <Panel
                                border
                                noPadding
                                css={css`
                                  min-width: 138px;
                                `}
                              >
                                {item.children.map((child) => (
                                  <Link
                                    key={child.path}
                                    to={child.path}
                                    css={css`
                                      display: block;
                                      padding: 10px 0px;
                                      text-align: center;
                                      text-decoration: none;

                                      &:hover {
                                        background-color: ${theme.colors.text
                                          .background};
                                      }

                                      &:first-child {
                                        border-top-left-radius: 12px;
                                        border-top-right-radius: 12px;
                                      }

                                      &:last-child {
                                        border-bottom-left-radius: 12px;
                                        border-bottom-right-radius: 12px;
                                      }
                                    `}
                                  >
                                    <Typography
                                      size={16}
                                      weight={900}
                                      color="primary"
                                    >
                                      {child.label}
                                    </Typography>
                                  </Link>
                                ))}
                              </Panel>
                            </div>
                          )}
                        </Typography>
                      ),
                    }))}
                    flex={false}
                  />
                </NavBarWrapper>
              )}
              <Col xs="content">
                <Row justify="end" align="center" gutterWidth={10}>
                  {/* TODO: implement */}
                  {/* <Col width="auto">
                    <IconButton
                      title="Notification"
                      size={45}
                      icons={{
                        default: iconNotification,
                        hover: iconNotificationHover,
                      }}
                    />
                  </Col> */}
                  <Col width="auto">
                    {connectedWallet ? (
                      <WalletInfo
                        title="My wallet"
                        isOpen={walletPopover.isOpen}
                        onGoBack={() => walletPopover.close()}
                        connectButton={
                          <Button onClick={walletPopover.toggle}>
                            {screenClass === MOBILE_SCREEN_CLASS
                              ? ellipsisCenter(connectedWallet.walletAddress)
                              : `${ellipsisCenter(
                                  connectedWallet.walletAddress,
                                )} | ${formatNumber(
                                  cutDecimal(
                                    amountToValue(balance) || 0,
                                    DISPLAY_DECIMAL,
                                  ),
                                )} ${XPLA_SYMBOL}`}
                            <img
                              src={iconDropdown}
                              width={22}
                              alt="dropdown"
                              css={css`
                                ${walletPopover.isOpen &&
                                css`
                                  transform: rotateX(-180deg);
                                `}
                              `}
                            />
                          </Button>
                        }
                      >
                        <>
                          <Hr size={1} />
                          <Row
                            direction="column"
                            nogutter
                            css={css`
                              padding-top: 20px;
                              text-align: left;
                            `}
                          >
                            <Col
                              style={{
                                flex: "unset",
                                paddingTop:
                                  screenClass === MOBILE_SCREEN_CLASS
                                    ? "9px"
                                    : "0px",
                              }}
                            >
                              <Typography
                                color={theme.colors.primary}
                                weight={900}
                              >
                                Your address
                              </Typography>
                            </Col>
                            <Col style={{ flex: "unset", paddingTop: "10px" }}>
                              <Row nogutter align="center">
                                <Col width="auto">
                                  <IconButton
                                    size={24}
                                    icons={{ default: iconXpla }}
                                  />
                                </Col>
                                <Col style={{ paddingLeft: "4px" }}>
                                  <Typography
                                    size={16}
                                    color={theme.colors.primary}
                                    weight="bold"
                                  >
                                    {connectedWallet.connection.name}
                                  </Typography>
                                </Col>
                                <Col width="auto">
                                  <a
                                    href={getAddressLink(
                                      connectedWallet.walletAddress,
                                      network.name,
                                    )}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                  >
                                    <IconButton
                                      size={18}
                                      icons={{ default: iconLink }}
                                    />
                                  </a>
                                </Col>
                              </Row>
                            </Col>
                            <Col style={{ flex: "unset", paddingTop: "4px" }}>
                              <Box
                                css={css`
                                  padding: 12px 12px;
                                  font-weight: bold;
                                  text-align: start;
                                  .${MOBILE_SCREEN_CLASS} & {
                                    padding: 12px 16px;
                                  }
                                `}
                              >
                                <Row
                                  nogutter
                                  justify="center"
                                  align="center"
                                  css={css`
                                    display: flex;
                                    justify-content: space-between;
                                    & > div {
                                      line-height: 1;
                                    }
                                  `}
                                >
                                  <Col>
                                    {ellipsisCenter(
                                      connectedWallet?.walletAddress,
                                      10,
                                    )}
                                  </Col>
                                  <Col
                                    width="auto"
                                    css={css`
                                      font-size: 0;
                                    `}
                                  >
                                    <Copy
                                      value={connectedWallet?.walletAddress}
                                    />
                                  </Col>
                                </Row>
                              </Box>
                            </Col>
                            <Col style={{ flex: "unset", paddingTop: "20px" }}>
                              <Typography
                                color={theme.colors.primary}
                                weight={900}
                              >
                                Balance
                              </Typography>
                            </Col>
                            <Col style={{ flex: "unset", paddingTop: "10px" }}>
                              <Row nogutter justify="start" align="center">
                                <Col width="auto">
                                  <IconButton
                                    size={24}
                                    icons={{ default: iconXpla }}
                                  />
                                </Col>
                                <Col style={{ paddingLeft: "4px" }}>
                                  <Typography
                                    size={16}
                                    color={theme.colors.primary}
                                    weight="bold"
                                  >
                                    {XPLA_SYMBOL}
                                  </Typography>
                                </Col>
                              </Row>
                            </Col>
                            <Col style={{ flex: "unset", paddingTop: "4px" }}>
                              <Box
                                css={css`
                                  padding: 12px 12px;
                                  .${MOBILE_SCREEN_CLASS} & {
                                    padding: 12px 16px;
                                  }
                                `}
                              >
                                <Typography
                                  size={16}
                                  color={theme.colors.text.primary}
                                  weight="bold"
                                >
                                  {formatNumber(amountToValue(balance) || 0)}
                                </Typography>
                                <Typography
                                  color={theme.colors.text.secondary}
                                  weight="normal"
                                >
                                  -
                                </Typography>
                              </Box>
                            </Col>
                            <Col style={{ flex: "unset", paddingTop: "20px" }}>
                              <Button
                                size="large"
                                variant="secondary"
                                css={css`
                                  width: 100%;
                                  background-color: ${theme.colors.text
                                    .background};
                                `}
                                onClick={() => {
                                  wallet.disconnect();
                                  setTimeout(() => {
                                    window.location.reload();
                                  }, 100);
                                }}
                              >
                                Disconnect
                              </Button>
                            </Col>
                          </Row>
                        </>
                      </WalletInfo>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => connectWalletModal.open()}
                      >
                        Connect wallet
                      </Button>
                    )}
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </div>
      </Wrapper>
    </>
  );
}

export default Header;
