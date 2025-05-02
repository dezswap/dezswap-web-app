import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Tippy, { TippyProps } from "@tippyjs/react/headless";
import { useFormatTo } from "hooks/useFormatTo";
import { NavLink } from "react-router-dom";

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
  position: relative;
  ${({ flex }) =>
    flex &&
    css`
      flex: 1;
    `}

  &.active:not(.disabled), &:hover:not(.disabled), &[aria-expanded="true"] {
    opacity: 1;
  }

  &.disabled {
    cursor: default;
  }
`;

interface NavBarProps {
  items: (React.ComponentProps<typeof NavItem> & {
    key?: React.Key;
    disabled?: boolean;
    tippyProps?: TippyProps;
  })[];
  flex?: boolean;
}

function NavBar({ items, flex = true }: NavBarProps) {
  const { formatTo } = useFormatTo();

  return (
    <Wrapper>
      {items.map(
        ({
          key,
          disabled,
          to,
          tippyProps = {
            disabled: true,
          },
          ...navItemProps
        }) => (
          <Tippy {...tippyProps} key={key ?? `${to.toString()}`}>
            <NavItem
              className={`${navItemProps.className ?? ""} ${
                disabled ? "disabled" : ""
              }`}
              to={formatTo({ to: disabled ? "#" : to })}
              {...navItemProps}
              flex={flex}
            />
          </Tippy>
        ),
      )}
    </Wrapper>
  );
}

export default NavBar;
