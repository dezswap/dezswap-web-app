import styled from "@emotion/styled";

const Hr = styled.div`
  width: 100%;
  height: 0;
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.primary};
`;

export default Hr;
