import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Numeric } from "@xpla/xpla.js";
import { forwardRef, useCallback, useRef } from "react";

import { MOBILE_SCREEN_CLASS } from "~/constants/layout";

import { sanitizeNumberInput } from "~/utils";

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
            .${MOBILE_SCREEN_CLASS} & {
              padding: 14px 13px;
            }
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

export interface NumberInputProps extends InputProps {
  decimals?: number;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ decimals = 18, onKeyDown, onKeyUp, onChange, ...InputProps }, ref) => {
    const isIMEActive = useRef(false);
    const isKeyPressing = useRef(false);
    const lastValue = useRef<string | undefined>(undefined);

    const handleInput = useCallback<React.FormEventHandler<HTMLInputElement>>(
      (event) => {
        const target = event.currentTarget;
        if (
          isIMEActive.current ||
          !isKeyPressing.current ||
          target.value.split(".").length > 2
        ) {
          if (lastValue.current) {
            target.value = lastValue.current;
          }
        }
        const sanitizedValue = sanitizeNumberInput(target.value, decimals);
        if (target.value !== sanitizedValue) {
          event.preventDefault();
          target.value = sanitizedValue;
        }
      },
      [decimals],
    );

    const handleKeyDown = useCallback<
      React.KeyboardEventHandler<HTMLInputElement>
    >(
      (event) => {
        const target = event.currentTarget;
        isKeyPressing.current = true;
        isIMEActive.current = event.key === "Process";
        lastValue.current = target.value;
        if (isIMEActive.current) {
          event.preventDefault();
        }
        if (event.key.length === 1 && !event.ctrlKey) {
          const regex = /[^0-9.]/g;
          const isAllowedKey = !regex.test(event.key);
          const selectedText = target.value?.substring(
            target.selectionStart || 0,
            target.selectionEnd || 0,
          );
          if (
            !isAllowedKey ||
            (event.key === "." &&
              event.currentTarget.value?.includes(".") &&
              !selectedText.includes("."))
          ) {
            event.preventDefault();
          }
        }
        if (onKeyDown) {
          onKeyDown(event);
        }
      },
      [onKeyDown],
    );

    const handleKeyUp = useCallback<
      React.KeyboardEventHandler<HTMLInputElement>
    >(
      (event) => {
        isKeyPressing.current = false;
        if (onKeyUp) {
          onKeyUp(event);
        }
      },
      [onKeyUp],
    );

    const handleChange = useCallback<
      React.ChangeEventHandler<HTMLInputElement>
    >(
      (event) => {
        const target = event.currentTarget;
        if (target.value) {
          try {
            Numeric.parse(target.value, { throwOnError: true });
            if (onChange) {
              onChange(event);
            }
          } catch (error) {
            event.preventDefault();
          }
        }
      },
      [onChange],
    );

    return (
      <Input
        ref={ref}
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        pattern="^[0-9]*[.]?[0-9]*$"
        inputMode="decimal"
        {...InputProps}
      />
    );
  },
);
