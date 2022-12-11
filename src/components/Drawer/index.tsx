import { css } from "@emotion/react";
import styled from "@emotion/styled";

interface DrawerProps {
  position?: "absolute" | "fixed";
  anchor?: "left" | "right" | "top" | "bottom";
  isOpen?: boolean;
}

const Drawer = styled.section<DrawerProps>(
  ({ position = "fixed", anchor = "right", isOpen = false }) => css`
    position: ${position};
    display: block;
    width: 100%;
    height: 100%;

    transition: all 1s cubic-bezier(0, 1, 0, 1);
    z-index: 50;

    ${anchor === "right"
      ? css`
          right: 0;
        `
      : css`
          left: 0;
        `}
    ${anchor === "bottom"
      ? css`
          bottom: 0;
        `
      : css`
          top: 0;
        `}

    ${!isOpen &&
    css`
      ${anchor}: -100%;
      &,
      & * {
        pointer-events: none;
      }
    `}

    ${isOpen &&
    css`
      ${anchor}: 0%;
    `}
  `,
);

export default Drawer;
