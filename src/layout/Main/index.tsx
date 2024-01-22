import { Fragment, PropsWithChildren, useMemo } from "react";
import styled from "@emotion/styled";
import { useAtomValue } from "jotai";
import disclaimerLastSeenAtom from "stores/disclaimer";
import DisclaimerModal from "components/Modal/DisclaimerModal";
import globalElementsAtom from "stores/globalElements";
import Header, {
  DEFAULT_HEADER_HEIGHT,
  BANNER_HEIGHT,
} from "layout/Main/Header";
import NavBar from "components/NavBar";
import IconButton from "components/IconButton";
import Typography from "components/Typography";
import iconOverview from "assets/icons/icon-overview-24px.svg";
import iconTrade from "assets/icons/icon-trade.svg";
import iconPool from "assets/icons/icon-pool.svg";
import iconWallet from "assets/icons/icon-wallet.svg";
import { useScreenClass } from "react-grid-system";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import useNetwork from "hooks/useNetwork";
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
          <IconButton icons={{ default: navLink.icon }} size={24} />
          <Typography size={12} weight={900} color="primary">
            {navLink.label}
          </Typography>
        </div>
      );
      return {
        to: navLink.path,
        children,
      };
    })}
  />
);

function MainLayout({ children }: PropsWithChildren) {
  const screenClass = useScreenClass();
  const network = useNetwork();

  const globalElements = useAtomValue(globalElementsAtom);
  const disclaimerLastSeen = useAtomValue(disclaimerLastSeenAtom);
  const isDisclaimerAgreed = useMemo(() => {
    if (!disclaimerLastSeen) return false;
    const date = new Date();
    date.setDate(date.getDate() - 3);
    return disclaimerLastSeen > date;
  }, [disclaimerLastSeen]);
  return (
    <>
      <Header />
      <Wrapper hasBanner={network.name !== "mainnet"}>
        {isDisclaimerAgreed && children}
        <BrowserDelegateButton />
        <FooterWrapper>
          <Footer />
        </FooterWrapper>
      </Wrapper>

      {[MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(screenClass) && (
        <>
          <NavBarOffset>{navBar}</NavBarOffset>
          <NavBarWrapper>{navBar}</NavBarWrapper>
        </>
      )}

      <DisclaimerModal isOpen={!isDisclaimerAgreed} />
      {globalElements.map(({ element, id }) => (
        <Fragment key={id}>{element}</Fragment>
      ))}
    </>
  );
}

export default MainLayout;
