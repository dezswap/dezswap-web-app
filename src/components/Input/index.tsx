import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { formatDecimals, formatNumber } from "utils";

type InputVariant = "default" | "base" | "primary";
type InputSize = "default" | "large";
type InputAlign = "left" | "center" | "right" | "justify";
type InputBorder = "none" | "solid";

interface WrapperProps {
  variant?: InputVariant;
  size?: InputSize;
  height?: number;
  borderStyle?: InputBorder;
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

  ${({ height }) =>
    height
      ? css`
          height: ${height}px;
        `
      : css`
          height: auto;
        `}

  ${({ borderStyle = "none" }) => css`
    border-style: ${borderStyle};
  `}

  ${({ size, variant }) => {
    switch (size) {
      case "large":
        return css`
          border-width: 3px;
          border-radius: 12px;

          ${variant !== "base" &&
          css`
            padding: 14px 16px;
          `}

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
          border-width: 1px;
          border-radius: 8px;

          ${variant !== "base" &&
          css`
            padding: 8px 16px;
          `}

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
          &:has(input:focus),
          &:active,
          &:has(input.active) {
            border-color: ${theme.colors.primary};
          }
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
  (
    {
      variant,
      size,
      height,
      borderStyle,
      align,
      prefix,
      suffix,
      ...inputProps
    },
    ref,
  ) => {
    return (
      <Wrapper
        variant={variant}
        size={size}
        height={height}
        borderStyle={borderStyle}
        align={align}
      >
        {prefix}
        <input ref={ref} {...inputProps} />
        {suffix}
      </Wrapper>
    );
  },
);

export default Input;

interface NumberInput extends InputProps {
  decimals?: number;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInput>(
  ({ decimals = 18, ...inputProps }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    useEffect(() => {
      const elInput = inputRef.current;
      const handleKeydown = (event: Event) => {
        const target = event.target as HTMLInputElement;

        target.value = target.value.replace(/[^0-9.]/g, "");

        if (target.value?.split(".").length > 2) {
          event.preventDefault();
          const index = target.value.lastIndexOf(".");
          target.value =
            target.value.substring(0, index) +
            target.value.substring(index + 1, target.value.length);
        }
        if (
          target.value.includes(".") &&
          (target.value?.split(".").pop()?.length || 0) > decimals
        ) {
          event.preventDefault();
          target.value = formatDecimals(target.value, decimals);
        }
      };
      elInput?.addEventListener("keydown", handleKeydown);
      elInput?.addEventListener("keyup", handleKeydown);
      elInput?.addEventListener("keypress", handleKeydown);
      return () => {
        if (elInput) {
          elInput.removeEventListener("keydown", handleKeydown);
          elInput.removeEventListener("keyup", handleKeydown);
          elInput.removeEventListener("keypress", handleKeydown);
        }
      };
    }, [decimals]);

    useEffect(() => {
      const intervalId = setInterval(() => {
        if (inputRef.current && inputRef.current !== document.activeElement) {
          inputRef.current.value = formatNumber(
            inputRef.current.value.replace(/,/g, ""),
          );
        }
      }, 100);
      return () => {
        clearInterval(intervalId);
      };
    }, []);

    return (
      <Input
        ref={inputRef}
        {...inputProps}
        onFocus={(event) => {
          if (inputRef.current) {
            inputRef.current.value = inputRef.current.value.replace(/,/g, "");
            inputRef.current.type = "number";
          }
          if (inputProps.onFocus && event) {
            inputProps.onFocus(event);
          }
        }}
        onBlur={(event) => {
          const value = inputRef?.current?.value;
          if (inputProps.onBlur) {
            inputProps.onBlur(event);
          }
          if (inputRef.current && event) {
            inputRef.current.type = "text";
            inputRef.current.value = formatNumber(value);
          }
        }}
      />
    );
  },
);
