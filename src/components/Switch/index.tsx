import styled from "@emotion/styled";

const Wrapper = styled.label`
  display: inline-block;
  position: relative;
  width: 48px;
  height: 24px;
  border: 5px solid ${({ theme }) => theme.colors.primary};
  border-radius: 30px;
  background-color: ${({ theme }) => theme.colors.primary};
  box-sizing: content-box;

  cursor: pointer;

  & > input {
    width: 0%;
    height: 0%;
    opacity: 0;
    position: absolute;
    z-index: -1;
  }
`;

const Handle = styled.div`
  position: relative;
  width: 50%;
  height: 0;
  padding-bottom: 50%;
  background-color: ${({ theme }) => theme.colors.text.background};
  border-radius: 50%;
  transition: left 0.125s cubic-bezier(1, 0, 0, 1);
  left: 0;

  input:checked ~ & {
    left: 50%;
  }
`;

function Switch(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrapper>
      <input type="checkbox" {...props} />
      <Handle />
    </Wrapper>
  );
}

export default Switch;
