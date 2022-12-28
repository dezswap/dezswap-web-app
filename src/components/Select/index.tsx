import styled from "@emotion/styled";
import { useMemo } from "react";

import iconDropdown from "assets/icons/icon-dropdown-arrow.svg";
import Typography from "components/Typography";
import { css } from "@emotion/react";
import { useModal } from "hooks/useModal";

type Value = string | number;

interface Option {
  key?: React.Key;
  label?: React.ReactNode;
  value?: Value;
}

interface SelectProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  options?: Option[];
  onChange?(value: Value, option: Option): void;
  outline?: boolean;
  block?: boolean;
}

interface WrapperProps {
  outline?: boolean;
  isOpen?: boolean;
  block?: boolean;
}

const Wrapper = styled.button<WrapperProps>`
  ${({ theme, outline, isOpen, block }) => {
    return css`
      display: inline-flex;
      flex-direction: column;
      width: auto;
      height: auto;
      position: relative;

      ${block &&
      css`
        display: flex;
        width: 100%;
      `}

      margin: 0;
      font-weight: bold;
      line-height: 1;
      font-size: 16;
      letter-spacing: normal;

      background: none;
      padding: 0;
      border-radius: 30px;
      border: none;
      overflow: hidden;

      ${outline &&
      css`
        border: 3px solid ${theme.colors.primary};
      `}

      cursor: pointer;
      user-select: none;

      & > div:first-of-type {
        padding: 6px 12px;
        display: inline-flex;
        justify-content: flex-start;
        align-items: center;
        gap: 3px;

        ${block &&
        css`
          display: flex;
          width: 100%;
        `}

        &:hover {
          background-color: ${theme.colors.white};
        }

        &::after {
          content: "";
          display: inline-block;
          position: relative;
          width: 20px;
          height: 20px;
          vertical-align: middle;
          margin-left: auto;

          background-image: url(${iconDropdown});
          background-size: contain;
          background-position: 50% 50%;
          background-repeat: no-repeat;

          ${isOpen &&
          css`
            transform: rotateX(-180deg);
          `}
          .cm & {
            display: none;
          }
        }
      }

      & > button {
        &:hover {
          background-color: ${theme.colors.primary};
          & * {
            color: ${theme.colors.secondary};
          }
        }
      }

      &:hover {
        background-color: ${theme.colors.white};
      }
    `;
  }}
`;

Wrapper.defaultProps = {
  type: "button",
};

const OptionWrapper = styled.button`
  width: 100%;
  height: auto;
  position: relative;
  background-color: transparent;
  margin: 0;
  padding: 0;
  border: none;
  padding: 5px 20px 5px 0;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }
`;

function Select({
  options,
  value: selectedValue,
  onChange,
  onClick,
  ...buttonProps
}: SelectProps) {
  const select = useModal(false);
  const selectedOption = useMemo(
    () => options?.find(({ value }) => value === selectedValue) ?? options?.[0],
    [options, selectedValue],
  );
  return (
    <>
      <Wrapper
        {...buttonProps}
        onClick={(event) => {
          if (onClick) {
            onClick(event);
          }
          if (options?.length && options?.length > 1) {
            select.toggle();
          }
        }}
        isOpen={select.isOpen}
        css={css`
          position: absolute;
        `}
      >
        {["string", "number"].includes(typeof selectedOption?.label) ? (
          <>&nbsp;</>
        ) : undefined}
        <Typography
          css={css`
            line-height: 1;
          `}
        >
          {selectedOption?.label}
        </Typography>
        {select.isOpen &&
          options
            ?.filter((option) => option.value !== selectedOption?.value)
            ?.map(({ label, value, ...option }) => (
              <OptionWrapper
                {...option}
                onClick={(event) => {
                  event.stopPropagation();
                  if (onChange && value) {
                    onChange(value, option);
                  }
                  select.close();
                }}
              >
                <Typography
                  css={css`
                    line-height: 1;
                  `}
                >
                  {label}
                </Typography>
              </OptionWrapper>
            ))}
      </Wrapper>

      {/* Offset */}
      <Wrapper
        outline={buttonProps.outline}
        css={css`
          opacity: 0;
          position: relative;
          z-index: -1;
        `}
      >
        {["string", "number"].includes(typeof selectedOption?.label) ? (
          <>&nbsp;</>
        ) : undefined}
        <Typography
          css={css`
            line-height: 1;
          `}
          color="unset"
        >
          {selectedOption?.label}
        </Typography>
      </Wrapper>
    </>
  );
}

export default Select;
