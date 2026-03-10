import { css } from "@emotion/react";
import { Container } from "react-grid-system";

import Hr from "~/components/Hr";
import ScrollToTop from "~/components/ScrollToTop";
import Typography from "~/components/Typography";

import AllTokens from "./AllTokens";
import Charts from "./Charts";
import Pools from "./Pools";
import Recent from "./Recent";
import TopMovers from "./TopMovers";
import Transactions from "./Transactions";

function AnalyticsPage() {
  return (
    <Container>
      <ScrollToTop />
      <Typography
        color="primary"
        size={32}
        weight={900}
        css={css`
          padding: 19px 0;
        `}
      >
        Analytics
      </Typography>
      <Hr
        css={css`
          margin-bottom: 20px;
        `}
      />
      <div
        css={css`
          margin-bottom: 14px;
        `}
      >
        <Recent />
      </div>
      <div
        css={css`
          margin-bottom: 50px;
        `}
      >
        <Charts />
      </div>

      <Typography
        color="primary"
        size={32}
        weight={900}
        css={css`
          margin-bottom: 19px;
        `}
      >
        Tokens
      </Typography>
      <Hr
        css={css`
          margin-bottom: 20px;
        `}
      />
      <div
        css={css`
          margin-bottom: 14px;
        `}
      >
        <TopMovers />
      </div>
      <div
        css={css`
          margin-bottom: 50px;
        `}
      >
        <AllTokens />
      </div>

      <Typography
        color="primary"
        size={32}
        weight={900}
        css={css`
          margin-bottom: 19px;
        `}
      >
        Pools
      </Typography>
      <Hr
        css={css`
          margin-bottom: 20px;
        `}
      />
      <div
        css={css`
          margin-bottom: 50px;
        `}
      >
        <Pools />
      </div>

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
      <div>
        <Transactions />
      </div>
    </Container>
  );
}

export default AnalyticsPage;
