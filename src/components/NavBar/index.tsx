import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { NavLink, NavLinkProps } from "react-router-dom";

interface NavBarProps {
  items: (NavLinkProps & { key?: React.Key; disabled?: boolean })[];
  flex?: boolean;
}

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavItem = styled(NavLink, {
  shouldForwardProp: (prop) => prop !== "flex",
})<{
  flex?: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  opacity: 0.5;
  text-align: center;
  padding: 7px 0;
  ${({ flex }) =>
    flex &&
    css`
      flex: 1;
    `}

  &.active:not(.disabled) {
    opacity: 1;
  }

  &.disabled {
    cursor: default;
  }
`;

function NavBar({ items, flex = true }: NavBarProps) {
  return (
    <Wrapper>
      {items.map(({ key, disabled, to, ...navLink }) => (
        <NavItem
          className={`${navLink.className ?? ""} ${disabled ? "disabled" : ""}`}
          key={key ?? `${to.toString()}`}
          to={disabled ? "#" : to}
          {...navLink}
          flex={flex}
        />
      ))}
    </Wrapper>
  );
}

export default NavBar;
