import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Col, Container, Row } from "react-grid-system";
import { Outlet, useParams } from "react-router-dom";

import Hr from "~/components/Hr";
import ScrollToTop from "~/components/ScrollToTop";
import Typography from "~/components/Typography";

import useDashboardTokenDetail from "~/hooks/dashboard/useDashboardTokenDetail";

import Chart from "~/pages/Tokens/TokenDetail/Chart";
import TokenSummary from "~/pages/Tokens/TokenDetail/TokenSummary";
import TokenTransactions from "~/pages/Tokens/TokenDetail/TokenTransactions";

const Wrapper = styled(Container)`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
`;

function PlayAnalytics() {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();

  const dashboardToken = useDashboardTokenDetail(tokenAddress || "");

  return (
    <Wrapper key={tokenAddress}>
      <ScrollToTop />
      <Container style={{ padding: "20px 0" }}>
        {dashboardToken !== null && (
          <>
            <Row
              justify="between"
              align="start"
              gutterWidth={14}
              css={css`
                row-gap: 13px;
                margin-bottom: 50px;
              `}
            >
              <Col xs={12} md={7}>
                {tokenAddress && (
                  <Chart tokenAddress={tokenAddress} defaultTabIndex={2} />
                )}
              </Col>
              <Col xs={12} md={5}>
                {tokenAddress && <TokenSummary tokenAddress={tokenAddress} />}
              </Col>
            </Row>

            <Typography
              color="primary"
              size={32}
              weight={900}
              css={css`
                margin-bottom: 19px;
              `}
            >
              Transactions
            </Typography>
            <Hr
              css={css`
                margin-bottom: 20px;
              `}
            />
            {tokenAddress && <TokenTransactions tokenAddress={tokenAddress} />}
          </>
        )}
      </Container>
      <Outlet />
    </Wrapper>
  );
}

export default PlayAnalytics;
