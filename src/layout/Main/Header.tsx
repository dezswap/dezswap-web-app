import { useEffect, useRef } from "react";
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
  LARGE_BROWSER_SCREEN_CLASS,
  MOBILE_SCREEN_CLASS,
  SMALL_BROWSER_SCREEN_CLASS,
} from "constants/layout";
import { useModal } from "hooks/useModal";
import ConnectWalletModal from "components/ConnectWalletModal";
import { useConnectedWallet, useWallet } from "@xpla/wallet-provider";

export const DEFAULT_HEADER_HEIGHT = 150;
export const SCROLLED_HEADER_HEIGHT = 77;
export const MOBILE_HEADER_HEIGHT = 65;

const Wrapper = styled.header`
  width: 100%;
  height: ${`${DEFAULT_HEADER_HEIGHT}px`};
  position: sticky;
  left: 0;
  top: ${`-${DEFAULT_HEADER_HEIGHT - SCROLLED_HEADER_HEIGHT}px`};
  z-index: 5000;
  backdrop-filter: blur(4px);

  .${MOBILE_SCREEN_CLASS} & {
    height: ${`${MOBILE_HEADER_HEIGHT}px`};
    top: 0;
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

  & > div {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    padding-top: 16px;
    padding-bottom: 24px;

    .xs & {
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }
  &.scrolled > div {
    padding-bottom: 16px;

    .xs & {
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
  .xs & {
    height: 45px;
    background-image: url(${imgSymbol});
  }

  .xs & {
    width: 40px;
  }
`;

const navLinks = [
  {
    path: "/",
    label: "Overview",
  },
  {
    path: "/trade",
    label: "Trade",
  },
  {
    path: "/pool",
    label: "Pool",
  },
];

function Header() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const screenClass = useScreenClass();
  const wallet = useWallet();
  const connectedWallet = useConnectedWallet();
  const connectWalletModal = useModal(false);

  useEffect(() => {
    const handleScroll = () => {
      const { current } = wrapperRef;
      if (!current) return;
      current.classList.toggle(
        "scrolled",
        window.scrollY > DEFAULT_HEADER_HEIGHT - SCROLLED_HEADER_HEIGHT,
      );
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Wrapper ref={wrapperRef}>
      <div>
        <Container>
          <Row justify="between" align="center" gutterWidth={10}>
            <Col xs="content">
              <Logo />
            </Col>
            {[SMALL_BROWSER_SCREEN_CLASS, LARGE_BROWSER_SCREEN_CLASS].includes(
              screenClass,
            ) && (
              <Col width={293}>
                <NavBar
                  items={navLinks.map((item) => ({
                    key: item.path,
                    to: item.path,
                    children: (
                      <Typography size={18} weight={900} color="primary">
                        {item.label}
                      </Typography>
                    ),
                  }))}
                  flex={false}
                />
              </Col>
            )}
            <Col xs="content">
              <Row justify="end" align="center" gutterWidth={10}>
                <Col width="auto">
                  <IconButton
                    title="Notification"
                    size={45}
                    icons={{
                      default: iconNotification,
                      hover: iconNotificationHover,
                    }}
                  />
                </Col>
                <Col width="auto">
                  {connectedWallet ? (
                    <Button
                      variant="primary"
                      onClick={() => wallet.disconnect()}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => connectWalletModal.open()}
                    >
                      Connect Wallet
                    </Button>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
          <ConnectWalletModal
            isOpen={connectWalletModal.isOpen}
            onRequestClose={() => connectWalletModal.close()}
          />
        </Container>
      </div>
    </Wrapper>
  );
}

export default Header;
