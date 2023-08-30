import { css } from "@emotion/react";
import styled from "@emotion/styled";
import imgDelegateUs from "assets/images/img-delegate-us.svg";
import Tooltip from "components/Tooltip";
import Typography from "components/Typography";
import { useEffect, useRef, useState } from "react";
import { Container } from "react-grid-system";
import { useMatch } from "react-router-dom";

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;

  & > div {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);

    max-width: 512px;
  }
`;

const ButtonWrapper = styled.div`
  width: calc((100vw - 100%) / 2);
  position: absolute;
  left: 100%;
  top: 0;
  text-align: right;

  & > div {
    display: inline-block;
    width: 100%;
    min-width: 120px;
    max-width: 217px;
  }
`;

const Button = styled.button`
  z-index: 1000;
  cursor: pointer;
  border: none;
  outline: none;
  width: 100%;
  height: 0;
  padding: 0;
  padding-bottom: 100%;
  background: url(${imgDelegateUs}) no-repeat;
  background-size: contain;
  background-position-x: 100%;
  background-position-y: 50%;
  transform: translateY(-50%);
`;

function DelegateButton() {
  const match = useMatch("/trade*");
  const isTradePage = !!match;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHidden, setIsHidden] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setIsHidden(!entries[0].isIntersecting);
      },
      { threshold: [1] },
    );
    if (buttonRef.current) {
      observer.observe(buttonRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <Wrapper>
      <Container style={isTradePage ? { width: 512 } : undefined}>
        <ButtonWrapper>
          <div
            css={
              isHidden
                ? css`
                    opacity: 0;
                  `
                : undefined
            }
          >
            <Tooltip
              offset={[-60, 20]}
              arrow
              content={
                <>
                  <Typography
                    color="primary"
                    size={16}
                    weight={900}
                    css={css`
                      text-align: center;
                      margin-bottom: 10px;
                    `}
                  >
                    Trading Fees back to the Community
                  </Typography>
                  <Typography color="primary" size={14} weight={700}>
                    As Dezswap claims to be a community DEX, we do not take any
                    financial profit from the protocol. Trading fee goes to
                    liquidity providers who rev up the market by depositing
                    their assets. We want Dezswap to bring the best value to
                    users and believe it will ultimately lead us to flourish
                    together.
                  </Typography>
                </>
              }
            >
              <Button ref={buttonRef} />
            </Tooltip>
          </div>
        </ButtonWrapper>
      </Container>
    </Wrapper>
  );
}

export default DelegateButton;
