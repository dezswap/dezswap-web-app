import { Col, Container, Row } from "react-grid-system";
import styled from "@emotion/styled";
import ScrollToTop from "components/ScrollToTop";
import { Outlet } from "react-router-dom";
import TopMovers from "pages/Analytics/TopMovers";
import AllTokens from "pages/Analytics/AllTokens";
import Transactions from "pages/Analytics/Transactions";
import useAPI from "hooks/useAPI";
import useWhiteList from "hooks/useWhiteList";
import { useMemo } from "react";
import { css } from "@emotion/react";

const Wrapper = styled(Container)`
  width: 100%;
  height: auto;
  position: relative;
  padding: 16px 0;
`;

function PlayMain() {
  const whiteList = useWhiteList();

  return (
    <Wrapper>
      <ScrollToTop />
      <div
        css={css`
          margin-bottom: 14px;
        `}
      >
        <TopMovers whiteList={whiteList} />
      </div>
      <Row gutterWidth={14}>
        <Col xs={6}>
          <AllTokens whiteList={whiteList} />
        </Col>
        <Col xs={6}>
          <Transactions whiteList={whiteList} />
        </Col>
      </Row>
      <Outlet />
    </Wrapper>
  );
}

export default PlayMain;
