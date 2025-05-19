import { useEffect, useMemo, useRef } from "react";
import styled from "@emotion/styled";
import { Col, Container, Row, useScreenClass } from "react-grid-system";

import imgLogo from "assets/images/logo.svg";
import imgSymbol from "assets/images/symbol.svg";
import iconNotification from "assets/icons/icon-notification.svg";
import iconNotificationHover from "assets/icons/icon-notification-hover.svg";
import iconNotificationWithBadge from "assets/icons/icon-notification-with-badge.svg";
import iconNotificationWithBadgeHover from "assets/icons/icon-notification-with-badge-hover.svg";
import iconArrowRight from "assets/icons/icon-arrow-right.svg";
import Button from "components/Button";
import IconButton from "components/IconButton";
import NavBar from "components/NavBar";
import Typography from "components/Typography";
import {
  DISPLAY_DECIMAL,
  LARGE_BROWSER_SCREEN_CLASS,
  MOBILE_SCREEN_CLASS,
  SMALL_BROWSER_SCREEN_CLASS,
} from "constants/layout";
import useModal from "hooks/useModal";
import {
  amountToValue,
  cutDecimal,
  ellipsisCenter,
  formatDecimals,
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
import Link from "components/Link";
import useConnectWalletModal from "hooks/modals/useConnectWalletModal";
import Tooltip from "components/Tooltip";
import SimpleBar from "simplebar/dist";
import useHashModal from "hooks/useHashModal";
import useDashboard from "hooks/dashboard/useDashboard";
import { Numeric } from "@xpla/xpla.js";
import useNotifications from "hooks/useNotifications";
import useConnectedWallet from "hooks/useConnectedWallet";
import { useChain } from "hooks/useChain";
import NotificationModal from "./NotificationModal";
import ChainModal from "./ChainModal";

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
  pointer-events: none;

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
    pointer-events: auto;
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

const ChainButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.text.background};
  display: flex;
  gap: 4px;
  border: 0;
  padding: 10px;
  position: relative;

  img {
    height: 19px;
    width: 19px;
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

const SubLink = styled(Link)`
  display: block;
  padding: 10px 0px;
  text-align: center;
  text-decoration: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors.text.background};
  }

  &:first-of-type {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  &:last-of-type {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`;

const navLinks = [
  {
    path: "/",
    label: "Analytics",
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
        disabled: true,
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
  title: React.ReactNode;
  isOpen: boolean;
  onGoBack?(): void;
  children: JSX.Element;
  connectButton: JSX.Element;
}) {
  const screenClass = useScreenClass();

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
          <div
            css={css`
              margin-bottom: 9px;
            `}
          >
            <Link to="wallet" onClick={onGoBack}>
              <Row justify="between" align="center" gutterWidth={0}>
                <Col
                  xs="content"
                  css={css`
                    opacity: 0;
                    pointer-events: none;
                  `}
                >
                  <IconButton size={24} icons={{ default: iconArrowRight }} />
                </Col>
                <Col xs="content">
                  <Typography color="primary" weight={900}>
                    My wallet
                  </Typography>
                </Col>
                <Col xs="content">
                  <IconButton size={24} icons={{ default: iconArrowRight }} />
                </Col>
              </Row>
            </Link>
          </div>
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
  const connectedWallet = useConnectedWallet();
  const xplaBalance = useBalance(XPLA_ADDRESS);
  const walletPopover = useModal();
  const notificationModal = useHashModal("notifications");
  const chainModal = useHashModal("chains");
  const { hasUnread: hasUnreadNotifications } = useNotifications();
  const theme = useTheme();
  const {
    chainName,
    selectedChain: { explorers, chainId, logoURIs, prettyName },
  } = useNetwork();
  const connectWalletModal = useConnectWalletModal();
  const isTestnet = useMemo(() => chainName !== "xpla", [chainName]);
  const { tokens: dashboardTokens } = useDashboard();
  const { wallet: interchainWallet } = useChain(chainName);

  const xplaPrice = useMemo(() => {
    const dashboardToken = dashboardTokens?.find(
      (item) => item.address === XPLA_ADDRESS,
    );
    return dashboardToken?.price;
  }, [dashboardTokens]);

  const { walletName, logo } = useMemo(() => {
    if (connectedWallet.isInterchain)
      return {
        walletName: interchainWallet.info.prettyName,
        logo: interchainWallet.info.logo?.toString(),
      };
    return {
      walletName: connectedWallet?.connection?.name,
      logo: connectedWallet?.connection?.icon,
    };
  }, [
    connectedWallet?.connection?.name,
    connectedWallet?.connection?.icon,
    connectedWallet.isInterchain,
    interchainWallet,
  ]);

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
    simpleBar?.getScrollElement()?.addEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleScroll);
    return () => {
      simpleBar
        ?.getScrollElement()
        ?.removeEventListener("scroll", handleScroll);
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
            TESTNET
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
                      tippyProps: {
                        disabled: !item.children,
                        placement: "bottom",
                        interactive: true,
                        offset: [0, 3],
                        render: (attrs) => (
                          <div {...attrs}>
                            <Panel
                              border
                              noPadding
                              css={css`
                                min-width: 138px;
                              `}
                            >
                              {item?.children?.map((child) => (
                                <Tooltip
                                  key={child.path}
                                  disabled={!child.disabled}
                                  content="Coming soon"
                                >
                                  <SubLink
                                    key={child.path}
                                    to={!child.disabled ? child.path : "#"}
                                    css={
                                      child.disabled
                                        ? css`
                                            cursor: default;
                                          `
                                        : undefined
                                    }
                                  >
                                    <Typography
                                      size={16}
                                      weight={900}
                                      color="primary"
                                    >
                                      {child.label}
                                    </Typography>
                                  </SubLink>
                                </Tooltip>
                              ))}
                            </Panel>
                          </div>
                        ),
                      },
                      children: (
                        <Typography size={18} weight={900} color="primary">
                          {item.label}
                        </Typography>
                      ),
                    }))}
                    flex={false}
                  />
                </NavBarWrapper>
              )}
              <Col xs="content">
                <Row justify="end" align="center" gutterWidth={10}>
                  <Col width="auto">
                    <IconButton
                      title="Notification"
                      size={45}
                      onClick={() => notificationModal.open()}
                      icons={
                        hasUnreadNotifications
                          ? {
                              default: iconNotificationWithBadge,
                              hover: iconNotificationWithBadgeHover,
                            }
                          : {
                              default: iconNotification,
                              hover: iconNotificationHover,
                            }
                      }
                    />
                  </Col>
                  <Col width="auto">
                    <ChainButton onClick={() => chainModal.open()}>
                      <img src={logoURIs.png} alt={prettyName} />
                      {
                        /* 
                      TODO: it will be updated https://github.com/cosmos/chain-registry/pull/6266
                      {prettyName}
                       */
                        chainName === "xpla" ? "XPLA" : "XPLA Testnet"
                      }
                    </ChainButton>
                  </Col>
                  <Col width="auto">
                    {/* // TODO: Refactor */}
                    {connectedWallet.walletAddress ? (
                      <WalletInfo
                        title={
                          <Row justify="center">
                            <Link
                              to="/wallet"
                              onClick={() => walletPopover.close()}
                            >
                              <Row
                                justify="center"
                                align="center"
                                gutterWidth={12}
                              >
                                <Col xs="content">
                                  <Typography
                                    size={20}
                                    weight={900}
                                    color="primary"
                                  >
                                    My wallet
                                  </Typography>
                                </Col>
                                <Col xs="content">
                                  <IconButton
                                    size={28}
                                    icons={{ default: iconArrowRight }}
                                  />
                                </Col>
                              </Row>
                            </Link>
                          </Row>
                        }
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
                                    amountToValue(xplaBalance) || 0,
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
                              <Typography color="primary" weight={900}>
                                Your address
                              </Typography>
                            </Col>
                            <Col style={{ flex: "unset", paddingTop: "10px" }}>
                              <Row nogutter align="center">
                                <Col width="auto">
                                  <IconButton
                                    size={24}
                                    icons={{
                                      default: logo,
                                    }}
                                  />
                                </Col>
                                <Col style={{ paddingLeft: "4px" }}>
                                  <Typography
                                    size={16}
                                    color="primary"
                                    weight="bold"
                                  >
                                    {walletName}
                                  </Typography>
                                </Col>
                                <Col width="auto">
                                  <a
                                    href={getAddressLink(
                                      connectedWallet.walletAddress,
                                      explorers?.[0].url,
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
                                      connectedWallet.walletAddress,
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
                                      value={connectedWallet.walletAddress}
                                    />
                                  </Col>
                                </Row>
                              </Box>
                            </Col>
                            <Col style={{ flex: "unset", paddingTop: "20px" }}>
                              <Typography color="primary" weight={900}>
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
                                    color="primary"
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
                                  color="text.primary"
                                  weight="bold"
                                >
                                  {formatNumber(
                                    amountToValue(xplaBalance) || 0,
                                  )}
                                </Typography>
                                <Typography
                                  color="text.secondary"
                                  weight="normal"
                                >
                                  =&nbsp;
                                  {xplaPrice &&
                                    `$${formatNumber(
                                      formatDecimals(
                                        Numeric.parse(xplaPrice).mul(
                                          amountToValue(xplaBalance) || 0,
                                        ),
                                        2,
                                      ),
                                    )}`}
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
                                  connectedWallet.disconnect();
                                  if (
                                    connectedWallet.isInterchain &&
                                    interchainWallet
                                  ) {
                                    interchainWallet.disconnect(chainId);
                                  }
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
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onRequestClose={() => notificationModal.close()}
      />
      <ChainModal
        isOpen={chainModal.isOpen}
        onRequestClose={() => chainModal.open(false)}
      />
    </>
  );
}

export default Header;
