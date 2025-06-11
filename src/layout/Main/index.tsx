import {
  Fragment,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useBlocker, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { useWallet, WalletStatus } from "@xpla/wallet-provider";
import { useFormatTo } from "hooks/useFormatTo";
import { useAtomValue } from "jotai";
import globalElementsAtom from "stores/globalElements";
import Header, {
  DEFAULT_HEADER_HEIGHT,
  BANNER_HEIGHT,
} from "layout/Main/Header";
import NavBar from "components/NavBar";
import { CHAIN_NAME_SEARCH_PARAM, DefaultChainName } from "constants/dezswap";
import Typography from "components/Typography";
import iconOverview from "assets/icons/icon-overview-24px.svg";
import iconTrade from "assets/icons/icon-trade.svg";
import iconPool from "assets/icons/icon-pool.svg";
import iconWallet from "assets/icons/icon-wallet.svg";
import { useScreenClass } from "react-grid-system";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import useNetwork from "hooks/useNetwork";
import useConnectWalletModal from "hooks/modals/useConnectWalletModal";
import useInvalidPathModal from "hooks/modals/useInvalidPathModal";
import useConnectedWallet from "hooks/useConnectedWallet";
import { getValidChain } from "utils/dezswap";
import Footer from "./Footer";
import BrowserDelegateButton from "./BrowserDelegateButton";

const Wrapper = styled.div<{ hasBanner?: boolean }>`
  position: relative;
  padding-bottom: 96px;
  min-height: ${({ hasBanner }) =>
    `calc(100vh - ${
      DEFAULT_HEADER_HEIGHT + (hasBanner ? BANNER_HEIGHT : 0)
    }px)`};
  .${TABLET_SCREEN_CLASS} &,
  .${MOBILE_SCREEN_CLASS} & {
    padding-bottom: unset;
    min-height: unset;
  }

  body:has(#disclaimer-modal) & {
    display: none;
  }
`;

const NavBarWrapper = styled.div`
  width: 100%;
  height: auto;
  position: fixed;
  left: 0;
  bottom: -1px;
  z-index: 4000;
  background-color: ${({ theme }) => theme.colors.background};
  box-shadow: 0 -1px 4px 0 rgba(0, 0, 0, 0.1);
`;

const NavBarOffset = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  opacity: 0;
  pointer-events: none;
`;

const NavBarIcon = styled.div`
  width: 100%;
  height: 24px;
  position: relative;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 50% 50%;
`;

const FooterWrapper = styled.div`
  width: 100%;
  height: auto;
  position: absolute;
  left: 0;
  bottom: 0;

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    position: relative;
  }
`;

function NavComponent() {
  const { formatTo } = useFormatTo();

  const navLinks = [
    {
      path: "/",
      icon: iconOverview,
      label: "Analytics",
    },
    {
      path: "/trade",
      icon: iconTrade,
      label: "Trade",
    },
    {
      path: "/earn",
      icon: iconPool,
      label: "Earn",
    },
    {
      path: "/wallet",
      icon: iconWallet,
      label: "My Wallet",
    },
  ];

  const navBar = (
    <NavBar
      items={navLinks.map((navLink) => {
        const children = (
          <div>
            <NavBarIcon style={{ backgroundImage: `url(${navLink.icon})` }} />
            <Typography size={12} weight={900} color="primary">
              {navLink.label}
            </Typography>
          </div>
        );
        return {
          to: formatTo({ to: navLink.path }),
          children,
        };
      })}
    />
  );
  return navBar;
}
function MainLayout({ children }: PropsWithChildren) {
  const wallet = useWallet();
  const screenClass = useScreenClass();
  const { chainName } = useNetwork();
  const globalElements = useAtomValue(globalElementsAtom);
  const { walletAddress } = useConnectedWallet();
  const connectWalletModal = useConnectWalletModal();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleModalClose = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(CHAIN_NAME_SEARCH_PARAM, DefaultChainName);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const { open } = useInvalidPathModal({
    onReturnClick: handleModalClose,
  });

  const { paramChainName, isValidChain } = useMemo(() => {
    const paramValue = searchParams.get(CHAIN_NAME_SEARCH_PARAM);
    return { paramChainName: paramValue, ...getValidChain(paramValue || "") };
  }, [searchParams]);

  useEffect(() => {
    open(!!(paramChainName && !isValidChain));
  }, [isValidChain, open, paramChainName]);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (wallet.status === WalletStatus.WALLET_CONNECTED && isValidChain) {
      const walletChain =
        wallet.network.name === "testnet" ? "xplatestnet" : "xpla";

      if (paramChainName === walletChain) return;
      newParams.set(CHAIN_NAME_SEARCH_PARAM, walletChain);
      setSearchParams(newParams);
      window.location.href = `?${newParams.toString()}`;
    }

    if (!paramChainName) {
      newParams.set(CHAIN_NAME_SEARCH_PARAM, chainName);
      setSearchParams(newParams);
      window.location.href = `?${newParams.toString()}`;
    }
  }, [
    chainName,
    isValidChain,
    paramChainName,
    searchParams,
    setSearchParams,
    wallet,
  ]);

  const needWalletConnection = useBlocker(({ nextLocation }) => {
    // TODO: remove hardcoded pathname
    if (nextLocation.pathname.startsWith("/wallet")) {
      if (wallet.status !== WalletStatus.WALLET_CONNECTED && !walletAddress) {
        return true;
      }
    }
    return false;
  });

  useEffect(() => {
    if (needWalletConnection.state === "blocked") {
      connectWalletModal.open();
      needWalletConnection.reset();
    }
  }, [needWalletConnection, connectWalletModal]);

  return (
    <>
      <Header />
      <Wrapper hasBanner={chainName !== "xpla"}>
        {children}
        <BrowserDelegateButton />
        <FooterWrapper>
          <Footer />
        </FooterWrapper>
      </Wrapper>

      {[MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(screenClass) && (
        <>
          <NavBarOffset>
            <NavComponent />
          </NavBarOffset>
          <NavBarWrapper>
            <NavComponent />
          </NavBarWrapper>
        </>
      )}
      {globalElements.map(({ element, id }) => (
        <Fragment key={id}>{element}</Fragment>
      ))}
    </>
  );
}

export default MainLayout;
