import styled from "@emotion/styled";

const Box = styled.div`
  width: 100%;
  height: auto;
  position: relative;

  background-color: ${({ theme }) => theme.colors.text.background};
  padding: 16px;
  border-radius: 12px;
`;

export default Box;
