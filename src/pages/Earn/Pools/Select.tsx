import styled from "@emotion/styled";
import useModal from "hooks/useModal";
import iconDropdown from "assets/icons/icon-dropdown-arrow.svg";
import iconDropdownDisabled from "assets/icons/icon-dropdown-arrow-disabled.svg";
import { css } from "@emotion/react";
import { useEffect, useRef, type ComponentProps } from "react";

type SelectValue = string | number;

interface SelectOption {
  key?: React.Key;
  label?: React.ReactNode;
  value: SelectValue;
}

interface WrapperProps {
  block?: boolean;
  disabled?: boolean;
}

interface SelectProps extends WrapperProps {
  value?: SelectValue;
  options?: SelectOption[];
  onClick?(event: React.MouseEvent<HTMLButtonElement>): void;
  onChange?(value: SelectValue, option: SelectOption): void;
  // TODO: placement;
}

const Wrapper = styled.div<WrapperProps>`
  ${({ block }) =>
    block
      ? css`
          display: block;
          width: 100%;
        `
      : css`
          display: inline-block;
          width: auto;
        `}
  position: relative;
`;

const StyledButton = styled.button<WrapperProps & { isOpen?: boolean }>`
  ${({ block }) =>
    block
      ? css`
          display: block;
          width: 100%;
        `
      : css`
          display: inline-block;
          width: auto;
        `}
  height: auto;
  position: relative;

  font-size: 14px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  border: none;
  padding: 0;

  & > span {
    padding: 7px 29px 7px 13px;
    display: block;
    border: 3px solid ${({ theme }) => theme.colors.primary};
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    overflow: hidden;

    &::after {
      content: "";
      vertical-align: middle;
      display: inline-block;
      width: 22px;
      height: 23px;
      position: absolute;
      top: 50%;
      right: 9px;
      background-image: url(${iconDropdown});
      background-repeat: no-repeat;
      background-position: 50% 50%;
      background-size: contain;
      transform: ${({ isOpen }) =>
        `translateY(-50%) rotateX(${isOpen ? 180 : 0}deg)`};
    }
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.disabled};
    & > span {
      border-color: ${({ theme }) => theme.colors.disabled};
      cursor: default;
      &::after {
        width: 12px;
        height: 12px;
        right: 10px;
        background-image: url(${iconDropdownDisabled});
      }
    }
  }
`;

function Button({
  type = "button",
  ...props
}: ComponentProps<typeof StyledButton>) {
  return <StyledButton type={type} {...props} />;
}

const OptionList = styled.div<{ isOpen?: boolean }>`
  position: absolute;
  top: 100%;
  margin-top: 6px;
  left: 50%;
  width: auto;
  height: auto;
  min-width: 100%;

  transform: translateX(-50%);

  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  border: 3px solid ${({ theme }) => theme.colors.primary};

  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  z-index: 1;
`;

const StyledOptionItem = styled.button`
  min-width: 100%;
  width: auto;
  height: auto;
  padding: 8px 10px;
  font-size: 14px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
  background-color: transparent;
  border: none;
  cursor: pointer;

  &:first-of-type {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  &:last-of-type {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.text.background};
  }
`;

function OptionItem({
  type = "button",
  ...props
}: ComponentProps<typeof StyledOptionItem>) {
  return <StyledOptionItem type={type} {...props} />;
}

function Select({
  value,
  options,
  onClick: handleClick,
  onChange: handleChange,
  ...wrapperProps
}: SelectProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedOption = options?.find((option) => option.value === value);
  const modal = useModal();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        modal.close();
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [modal]);

  return (
    <Wrapper ref={wrapperRef} {...wrapperProps}>
      <Button
        {...wrapperProps}
        isOpen={modal.isOpen}
        onClick={(event) => {
          event.stopPropagation();
          if (options?.length) {
            modal.toggle();
          }
          if (handleClick) {
            handleClick(event);
          }
        }}
      >
        <span>{selectedOption?.label ?? selectedOption?.value ?? value}</span>
      </Button>
      {options?.length && (
        <OptionList isOpen={modal.isOpen}>
          {options?.map((option) => {
            return (
              <OptionItem
                key={option.key ?? option.value}
                onClick={(event) => {
                  event.stopPropagation();
                  modal.close();
                  if (handleChange) {
                    handleChange(option.value, option);
                  }
                }}
              >
                {option.label ?? option.value}
              </OptionItem>
            );
          })}
        </OptionList>
      )}
    </Wrapper>
  );
}

export default Select;
