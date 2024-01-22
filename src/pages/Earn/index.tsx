import { css } from "@emotion/react";
import Hr from "components/Hr";
import IconButton from "components/IconButton";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import { Col, Container, Row, useScreenClass } from "react-grid-system";

import iconReload from "assets/icons/icon-reload.svg";
import iconReloadHover from "assets/icons/icon-reload-hover.svg";
import { NavLink as navLink, Outlet } from "react-router-dom";
import styled from "@emotion/styled";
import Tooltip from "components/Tooltip";

const NavBar = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
`;

const NavLink = styled(navLink)`
  display: inline-block;
  padding: 19px 0;
  text-decoration: none;
  border-bottom: 5px solid transparent;
  opacity: 0.5;

  &.active {
    opacity: 1;
    border-bottom-color: ${({ theme }) => theme.colors.primary};
  }
  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .${MOBILE_SCREEN_CLASS} & {
    padding: 10px 0 10px 0;
  }
`;

function EarnPage() {
  const screenClass = useScreenClass();
  return (
    <>
      <Container>
        <NavBar>
          <NavLink to="pools">
            <Typography
              size={screenClass === MOBILE_SCREEN_CLASS ? 26 : 32}
              color="primary"
              weight={900}
            >
              Pools
            </Typography>
          </NavLink>
          <Tooltip content="Coming soon" offset={[0, -12]}>
            <div>
              <NavLink className="disabled" to="lockdrop">
                <Typography
                  size={screenClass === MOBILE_SCREEN_CLASS ? 26 : 32}
                  color="primary"
                  weight={900}
                >
                  LP Lock&Drop
                </Typography>
              </NavLink>
            </div>
          </Tooltip>
          <IconButton
            css={css`
              margin-left: auto;
            `}
            size={38}
            icons={{ default: iconReload, hover: iconReloadHover }}
            onClick={() => {
              window.location.reload();
            }}
          />
        </NavBar>
        <Hr
          css={css`
            margin-bottom: 20px;
          `}
        />
      </Container>
      <Outlet />
    </>
  );
}

export default EarnPage;
