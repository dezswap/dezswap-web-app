import styled from "@emotion/styled";

const Banner = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.warning};
  padding-top: 5px;
  padding-bottom: 5px;
  text-align: center;
`;

export default Banner;
