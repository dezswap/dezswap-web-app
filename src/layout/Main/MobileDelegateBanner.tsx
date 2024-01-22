import styled from "@emotion/styled";
import { Container } from "react-grid-system";
import Typography from "components/Typography";
import Box from "components/Box";
import DelegateButton from "./DelegateButton";

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  margin-bottom: 30px;
`;

const Content = styled(Box)`
  padding-top: 0;
  padding-bottom: 0;
  border: none;
  background: none;
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > div {
    flex: 1;
  }
`;

const ButtonWrapper = styled.div`
  width: 50%;
  height: auto;
  position: absolute;
  right: 0;
  top: 0;
  max-width: 150px;
`;

const ButtonOffset = styled(ButtonWrapper)`
  position: relative;
  pointer-events: none;
  opacity: 0;
`;

function MobileDelegateBanner() {
  return (
    <Wrapper>
      <Container>
        <Content>
          <Typography size={14} weight={500} color="primary">
            Dezswap does not take any financial profit from the protocol.
            Trading fee goes to liquidity providers.
          </Typography>
          <ButtonOffset>
            <DelegateButton />
          </ButtonOffset>
        </Content>
      </Container>
      <ButtonWrapper>
        <DelegateButton />
      </ButtonWrapper>
    </Wrapper>
  );
}
export default MobileDelegateBanner;
