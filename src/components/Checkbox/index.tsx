import { forwardRef } from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";

import iconCheckbox from "assets/icons/icon-checkbox.svg";
import iconCheckboxChecked from "assets/icons/icon-checkbox-checked.svg";
import Typography from "components/Typography";

interface CheckboxProps extends React.HTMLProps<HTMLInputElement> {
  block?: boolean;
}

const Wrapper = styled.label<CheckboxProps>`
  width: auto;
  height: auto;
  position: relative;
  user-select: none;
  cursor: pointer;
  align-items: flex-start;
  gap: 8px;

  ${({ block }) =>
    block
      ? css`
          display: flex;
          justify-content: space-between;
        `
      : css`
          display: inline-flex;
          justify-content: flex-start;
        `}

  & > input {
    width: 0%;
    height: 0%;
    position: absolute;
    left: -1px;
    top: -1px;
    opacity: 0;

    & + span {
      width: auto;
      height: auto;
      position: relative;
      vertical-align: middle;
      display: inline-block;
    }
  }

  & > span::before {
    content: "";
    width: 24px;
    height: 24px;
    position: relative;
    display: inline-block;
    vertical-align: middle;
    background-image: url(${iconCheckbox});
    background-position: 50% 50%;
    background-size: contain;
    background-repeat: no-repeat;
    display: inline-block;
  }

  & > input:checked + span::before {
    background-image: url(${iconCheckboxChecked});
  }

  & > div {
    line-height: 24px;
    & > div {
      line-height: unset;
    }
  }
`;

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ children, block, type = "checkbox", ...props }, forwardedRef) => {
    return (
      <Wrapper block={block}>
        <input type={type} {...props} ref={forwardedRef} />
        <span />
        <div>
          {["number", "string", "boolean", "undefined"].includes(
            typeof children,
          ) ? (
            <Typography>{children || props.value}</Typography>
          ) : (
            children
          )}
        </div>
      </Wrapper>
    );
  },
);

export default Checkbox;
