import { css } from "@emotion/react";
import styled from "@emotion/styled";

interface IconButtonProps {
  size?: number;
  icons?: {
    default?: string;
    hover?: string;
    active?: string;
  };
}

const IconButton = styled.button<IconButtonProps>`
  position: relative;
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  min-width: ${({ size }) => `${size}px`};
  min-height: ${({ size }) => `${size}px`};
  border: none;
  outline: none;
  background: none;
  cursor: pointer;
  background-image: ${({ icons }) => `url(${icons?.default})`};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 50% 50%;

  &:hover,
  &:active {
    background-image: none;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: ${({ icons }) =>
      `url(${icons?.hover || icons?.default})`};
    background-size: contain;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    opacity: 0;
  }

  &:hover::before {
    opacity: 1;
  }
  &:active::before {
    opacity: 0;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: ${({ icons }) =>
      `url(${icons?.active ?? icons?.hover ?? icons?.default})`};
    background-size: contain;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    opacity: 0;
  }

  &:active::after {
    opacity: 1;
  }

  &:disabled {
    cursor: default;
  }

  ${({ onClick }) =>
    !onClick &&
    css`
      cursor: unset;
    `}
`;

IconButton.defaultProps = { type: "button" };

export default IconButton;
