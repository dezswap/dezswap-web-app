import styled from "@emotion/styled";
import { forwardRef } from "react";

const Wrapper = styled.label`
  position: relative;
  width: 58px;
  height: 33.5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 30px;
  border: 3px solid ${({ theme }) => theme.colors.disabled};
  padding: 2px;

  & > input {
    width: 0%;
    height: 0%;
    opacity: 0;
    position: absolute;
    z-index: -1;
  }

  &:has(input:checked) {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Handle = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  &::after {
    content: "";
    position: absolute;

    width: 24px;
    height: 24px;
    border-radius: 30px;
    background-color: ${({ theme }) => theme.colors.disabled};
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    transition: all 0.125s ease-in-out;
  }

  input:checked ~ &::after {
    left: 100%;
    background-color: ${({ theme }) => theme.colors.primary};
    transform: translate(-100%, -50%);
  }
`;

const ToggleButton = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ style, ...inputProps }, ref) => {
  return (
    <Wrapper style={style}>
      <input ref={ref} type="checkbox" {...inputProps} />
      <Handle />
    </Wrapper>
  );
});

export default ToggleButton;
