import { css } from "@emotion/react";
import styled from "@emotion/styled";

interface ButtonProps {
  size?: "default" | "large" | "xLarge";
  variant?: "default" | "primary" | "secondary" | "link" | "gradient" | "error";
  block?: boolean;
}

const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: auto;
  padding: 0 13px;
  border: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  ${({ size }) => {
    if (size === "xLarge") {
      return css`
        height: 70px;
        font-size: 22px;
        font-weight: 900;
      `;
    }
    if (size === "large") {
      return css`
        height: 48px;
        font-size: 16px;
        font-weight: 900;
      `;
    }
    return css`
      height: 38.5px;
      font-size: 14px;
      font-weight: 900;
    `;
  }}
  ${({ variant, theme }) => {
    switch (variant) {
      case "primary":
        return css`
          background-color: ${theme.colors.primary};
          border-color: ${theme.colors.primary};
          color: ${theme.colors.white};
          &:hover {
            opacity: 0.7;
          }
          &:disabled {
            background-color: ${theme.colors.disabled};
            border-color: ${theme.colors.disabled};
            color: ${theme.colors.white};
            opacity: 0.7;
          }
        `;
      case "secondary":
        return css`
          background-color: transparent;
          border-color: ${theme.colors.disabled};
          color: ${theme.colors.text.primary}b2;
          border-width: 1px;
          padding: 0 15px;

          &:hover,
          &:active,
          &.active {
            background-color: ${theme.colors.selected};
          }
        `;
      case "link":
        return css`
          background-color: transparent;
          border-color: transparent;
          color: ${theme.colors.primary};
          opacity: 0.5;
          &:hover,
          &:active,
          &.active {
            opacity: 1;
          }
        `;
      case "gradient":
        return css`
          background-color: transparent;
          background-image: ${theme.colors.gradient};
          border-color: ${theme.colors.primary};
          color: ${theme.colors.white};
          &:disabled {
            background-image: unset;
            background-color: ${theme.colors.disabled};
            border-color: ${theme.colors.selected};
          }
        `;
      case "error":
        return css`
          background-color: ${theme.colors.danger};
          border-color: ${theme.colors.danger};
          color: ${theme.colors.white};
          &:hover {
            opacity: 0.7;
          }
          &:disabled {
            background-color: ${theme.colors.disabled};
            border-color: ${theme.colors.disabled};
            color: ${theme.colors.white};
            opacity: 0.7;
          }
        `;
      default:
        return css`
          background-color: transparent;
          border-color: ${theme.colors.primary};
          color: ${theme.colors.primary};
          &:hover,
          &:active,
          &.active {
            background-color: ${theme.colors.white};
          }
        `;
    }
  }}

  ${({ block }) =>
    block &&
    css`
      width: 100%;
      display: flex;
    `}

  &:disabled {
    cursor: default;
  }
`;

Button.defaultProps = { type: "button" };

export default Button;
