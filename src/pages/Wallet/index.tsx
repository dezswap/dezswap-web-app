import { useEffect, useRef } from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useWallet } from "@xpla/wallet-provider";
import Button from "components/Button";
import Copy from "components/Copy";
import Hr from "components/Hr";
import IconButton from "components/IconButton";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { Col, Container, Row, useScreenClass } from "react-grid-system";
import iconOutlink from "assets/icons/icon-link-28.svg";
import { ellipsisCenter, getAddressLink } from "utils";
import useNetwork from "hooks/useNetwork";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import { Outlet } from "react-router-dom";
import useConnectWalletModal from "hooks/modals/useConnectWalletModal";
import useConnectedWallet from "hooks/useConnectedWallet";
import { useNavigate } from "hooks/useNavigate";
import ScrollToTop from "components/ScrollToTop";
import Assets from "./Assets";
import Pools from "./Pools";

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
`;

function WalletPage() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const { walletAddress } = useConnectedWallet();
  const {
    selectedChain: { explorers },
  } = useNetwork();
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const connectWalletModal = useConnectWalletModal();
  const isModalOpened = useRef(false);

  const handleDisconnectClick = () => {
    wallet.disconnect();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      connectWalletModal.open(!walletAddress);
      if (!walletAddress) {
        isModalOpened.current = true;
      }
    }, 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [connectWalletModal, walletAddress]);

  useEffect(() => {
    if (!connectWalletModal.isOpen && !walletAddress && isModalOpened.current) {
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectWalletModal]);

  return (
    <Wrapper>
      <ScrollToTop />
      {walletAddress && (
        <>
          <Container>
            <Typography
              color="primary"
              size={screenClass === MOBILE_SCREEN_CLASS ? 26 : 32}
              weight={900}
              css={css`
                padding: 19px 0;
              `}
            >
              My Wallet
            </Typography>
            <Hr
              css={css`
                margin-bottom: 20px;
              `}
            />
            <Panel
              shadow
              css={css`
                margin-bottom: 14px;
              `}
            >
              <Row
                justify="between"
                align="center"
                gutterWidth={0}
                css={css`
                  row-gap: 28px;
                `}
              >
                <Col xs={12} sm="content">
                  <Row
                    justify={
                      screenClass === MOBILE_SCREEN_CLASS ? "between" : "start"
                    }
                    align="center"
                    gutterWidth={10}
                  >
                    <Col xs="content">
                      <Typography
                        color="primary"
                        size={screenClass === MOBILE_SCREEN_CLASS ? 16 : 26}
                        weight={900}
                      >
                        {isSmallScreen
                          ? ellipsisCenter(walletAddress, 8)
                          : walletAddress}
                      </Typography>
                    </Col>
                    <Col xs="content">
                      <Row justify="start" align="center" gutterWidth={10}>
                        <Col xs="content">
                          <Copy size={38} value={walletAddress} />
                        </Col>
                        <Col xs="content">
                          <a
                            href={getAddressLink(
                              walletAddress,
                              explorers?.[0].url,
                            )}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            <IconButton
                              size={28}
                              icons={{ default: iconOutlink }}
                            />
                          </a>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
                <Col xs={12} sm="content">
                  <Button
                    variant="secondary"
                    block
                    css={css`
                      min-width: 150px;
                    `}
                    onClick={handleDisconnectClick}
                  >
                    Disconnect
                  </Button>
                </Col>
              </Row>
            </Panel>
            <div
              css={css`
                margin-bottom: 50px;
              `}
            >
              <Assets />
            </div>
            <Typography
              color="primary"
              size={32}
              weight={900}
              css={css`
                padding: 19px 0;
              `}
            >
              Pools
            </Typography>
            <Hr
              css={css`
                margin-bottom: 20px;
              `}
            />
            <div>
              <Pools />
            </div>
          </Container>
          <Outlet />
        </>
      )}
    </Wrapper>
  );
}

export default WalletPage;
