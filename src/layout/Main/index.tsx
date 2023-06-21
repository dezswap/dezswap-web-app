import { PropsWithChildren } from "react";
import styled from "@emotion/styled";
import Header, {
  DEFAULT_HEADER_HEIGHT,
  MOBILE_HEADER_HEIGHT,
  BANNER_HEIGHT,
} from "layout/Main/Header";
import NavBar from "components/NavBar";
import IconButton from "components/IconButton";
import Typography from "components/Typography";
import iconOverview from "assets/icons/icon-overview-24px.svg";
import iconTrade from "assets/icons/icon-trade.svg";
import iconPool from "assets/icons/icon-pool.svg";
import { useScreenClass } from "react-grid-system";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import useNetwork from "hooks/useNetwork";
import Tooltip from "components/Tooltip";
import Footer from "./Footer";

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
    label: "Overview",
    disabled: true,
  },
  {
    path: "/trade",
    icon: iconTrade,
    label: "Trade",
  },
  {
    path: "/pool",
    icon: iconPool,
    label: "Pool",
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
        disabled: navLink.disabled,
        children: navLink.disabled ? (
          <Tooltip arrow content="Coming soon">
            {children}
          </Tooltip>
        ) : (
          children
        ),
      };
    })}
  />
);

function MainLayout({ children }: PropsWithChildren) {
  const screenClass = useScreenClass();
  const network = useNetwork();
  return (
    <>
      <Header />
      <Wrapper hasBanner={network.name !== "mainnet"}>
        {children}
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
    </>
  );
}

export default MainLayout;
