import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { forwardRef } from "react";

interface StyledRadioButtonProps {
  block?: boolean;
  height?: number;
}

type RadioButtonProps = React.PropsWithChildren<
  React.InputHTMLAttributes<HTMLInputElement> & StyledRadioButtonProps
>;

const Wrapper = styled.label<StyledRadioButtonProps>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: auto;
  height: auto;
  user-select: none;

  ${({ block }) =>
    block &&
    css`
      width: 100%;
      display: flex;
    `}

  & > div {
    width: 100%;
    height: auto;
    position: relative;
    display: block;

    font-size: 16px;
    font-weight: 700;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: center;
    color: ${({ theme }) => theme.colors.text.primary};

    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.disabled};

    ${({ height }) => css`
      height: ${height}px;
    `}
  }

  & > input {
    width: 0%;
    height: 0%;
    position: absolute;
    left: -1px;
    top: -1px;
    opacity: 0;

    &:checked + div {
      background-color: ${({ theme }) => theme.colors.selected};
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ children, block = false, height, ...inputProps }, ref) => {
    return (
      <Wrapper block={block} height={height}>
        <input type="radio" {...inputProps} ref={ref} />
        <div>{children}</div>
      </Wrapper>
    );
  },
);

export default RadioButton;
