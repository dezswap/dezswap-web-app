import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Col, Container, Row } from "react-grid-system";
import { Outlet } from "react-router-dom";

import ScrollToTop from "~/components/ScrollToTop";

import usePlay3WhiteList from "~/hooks/usePlay3WhiteList";

import AllTokens from "~/pages/Analytics/AllTokens";
import TopMovers from "~/pages/Analytics/TopMovers";
import Transactions from "~/pages/Analytics/Transactions";

const Wrapper = styled(Container)`
  width: 100%;
  height: auto;
  position: relative;
  padding: 16px 0;
`;

function PlayMain() {
  const whiteList = usePlay3WhiteList();

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
