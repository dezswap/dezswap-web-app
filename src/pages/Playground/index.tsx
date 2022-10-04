import { Container } from "react-grid-system";
import styled from "@emotion/styled";

const Wrapper = styled(Container)`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
`;

function PlaygroundPage() {
  return (
    <Wrapper>Hello Dezswap!</Wrapper>
  );
}

export default PlaygroundPage;
