import { forwardRef } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

type InputVariant = "default" | "base" | "primary";
type InputSize = "default" | "large";
type InputAlign = "left" | "center" | "right" | "justify";

interface WrapperProps {
  variant?: InputVariant;
  size?: InputSize;
  align?: InputAlign;
}

type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "prefix"
> &
  WrapperProps & {
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
  };

const Wrapper = styled.div<WrapperProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: auto;
  position: relative;
  gap: 4px;
  border-style: solid;

  ${({ size, theme }) => {
    switch (size) {
      case "large":
        return css`
          padding: 14px 16px;
          border-width: 3px;
          border-radius: 12px;

          &,
          & > input {
            font-size: 22px;
            font-weight: 900;
            font-stretch: normal;
            font-style: normal;
            line-height: normal;
            letter-spacing: normal;
          }
        `;
      default:
        return css`
          padding: 8px 16px;
          border-width: 1px;
          border-radius: 8px;

          &,
          & > input {
            font-size: 16px;
            font-weight: 700;
            font-stretch: normal;
            font-style: normal;
            line-height: normal;
            letter-spacing: normal;
          }
        `;
    }
  }}

  ${({ variant, theme }) => {
    switch (variant) {
      case "base":
        return css`
          color: ${theme.colors.text.primary};
        `;
      case "primary":
        return css`
          border-color: ${theme.colors.primary};
          background-color: ${theme.colors.text.background};

          &,
          & > input {
            color: ${theme.colors.primary};
          }
        `;
      default:
        return css`
          border-color: ${theme.colors.disabled};
          background-color: ${theme.colors.text.background};
        `;
    }
  }}

  & > input {
    width: 100%;
    height: auto;
    position: relative;
    flex: 1;
    border: none;
    background: none;
    outline: none;

    ${({ align = "left" }) => css`
      text-align: ${align};
      &::placeholder {
        text-align: ${align};
      }
    `}

    &::placeholder {
      color: ${({ theme }) => theme.colors.text.placeholder};
    }
  }
`;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant, size, align, prefix, suffix, ...inputProps }, ref) => {
    return (
      <Wrapper variant={variant} size={size} align={align}>
        {prefix}
        <input ref={ref} {...inputProps} />
        {suffix}
      </Wrapper>
    );
  },
);

export default Input;
