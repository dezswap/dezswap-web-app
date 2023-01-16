import styled from "@emotion/styled";
import { useModal } from "hooks/useModal";
import iconDropdown from "assets/icons/icon-dropdown-arrow.svg";
import { css } from "@emotion/react";

type SelectValue = string | number;

interface SelectOption {
  key?: React.Key;
  label?: React.ReactNode;
  value: SelectValue;
}

interface WrapperProps {
  block?: boolean;
}

interface SelectProps extends WrapperProps {
  value?: SelectValue;
  options?: SelectOption[];
  onClick?(event: React.MouseEvent<HTMLButtonElement>): void;
  onChange?(value: SelectValue, option: SelectOption): void;
  // TODO: placement;
  // TODO: disabled;
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

const Button = styled.button<WrapperProps & { isOpen?: boolean }>`
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
    text-overflow: ellipsis;

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
`;

Button.defaultProps = {
  type: "button",
};

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

const OptionItem = styled.button`
  min-width: 100%;
  width: auto;
  height: auto;
  padding: 8px 10px;
  font-size: 14px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.white};
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

OptionItem.defaultProps = {
  type: "button",
};

function Select({
  value,
  options,
  onChange: handleChange,
  ...wrapperProps
}: SelectProps) {
  const selectedOption = options?.find((option) => option.value === value);
  const modal = useModal();

  return (
    <Wrapper>
      <Button
        {...wrapperProps}
        isOpen={modal.isOpen}
        onClick={(event) => {
          event.stopPropagation();
          if (options?.length) {
            modal.toggle();
          }
          if (wrapperProps.onClick) {
            wrapperProps.onClick(event);
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
