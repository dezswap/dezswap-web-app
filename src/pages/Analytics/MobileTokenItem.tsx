import { css } from "@emotion/react";
import AssetIcon from "components/AssetIcon";
import Typography from "components/Typography";
import Expand from "pages/Earn/Expand";
import { Col, Row } from "react-grid-system";

import styled from "@emotion/styled";
import { DashboardToken } from "types/dashboard-api";
import useAssets from "hooks/useAssets";
import { formatCurrency } from "utils";
import ChangeRateFormatter from "components/ChangeRateFormatter";
import { Link } from "react-router-dom";
import HoverUnderline from "components/HoverUnderline";

interface MobileTokenItemProps {
  number: number;
  token: DashboardToken;
}

const Content = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  flex: 1;
`;

const Label = styled(Typography)`
  margin-bottom: 6px;
`;
Label.defaultProps = {
  color: "primary",
  size: 14,
  weight: 900,
};

const Value = styled(Typography)``;
Value.defaultProps = {
  color: "primary",
  size: 16,
  weight: 500,
};

function MobileTokenItem({ number, token }: MobileTokenItemProps) {
  const { getAsset } = useAssets();
  const asset = getAsset(token.address);

  return (
    <Expand
      hasDivider={false}
      header={
        <Content
          css={css`
            padding: 20px;
          `}
        >
          <div>
            <Label>Token</Label>
            <Row
              justify="between"
              align="center"
              gutterWidth={10}
              wrap="nowrap"
            >
              <Col xs="content">
                <Typography color="primary">{number}</Typography>
              </Col>
              <Col
                xs="content"
                css={css`
                  font-size: 0;
                `}
              >
                <AssetIcon asset={{ icon: asset?.icon }} />
              </Col>
              <Col
                css={css`
                  min-width: 0;
                `}
              >
                <Value
                  css={css`
                    max-width: 100%;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                  `}
                >
                  <HoverUnderline>
                    <Link to={`/tokens/${token.address}`}>{asset?.name}</Link>
                  </HoverUnderline>
                </Value>
              </Col>
            </Row>
          </div>
          <div>
            <Label>Price</Label>
            <Value>{formatCurrency(token.price)}</Value>
          </div>
        </Content>
      }
    >
      <Content>
        <div>
          <Label>Price change</Label>
          <Value weight={900}>
            <ChangeRateFormatter rate={token.priceChange} hasBrackets={false} />
          </Value>
        </div>
        <div>
          <Label>Volume 24H</Label>
          <Value>{formatCurrency(token.volume24h)}</Value>
        </div>
        <div>
          <Label>TVL</Label>
          <Value>{formatCurrency(token.tvl)}</Value>
        </div>
      </Content>
    </Expand>
  );
}

export default MobileTokenItem;