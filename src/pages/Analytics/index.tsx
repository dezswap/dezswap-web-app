import { css } from "@emotion/react";
import Hr from "components/Hr";
import Typography from "components/Typography";
import { Container } from "react-grid-system";

function AnalyticsPage() {
  return (
    <Container>
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
    </Container>
  );
}

export default AnalyticsPage;
