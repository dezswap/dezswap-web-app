import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Numeric } from "@xpla/xpla.js";
import AssetIcon from "components/AssetIcon";
import ChangeRateFormatter from "components/ChangeRateFormatter";
import Hr from "components/Hr";
import Panel from "components/Panel";
import Typography from "components/Typography";
import useAssets from "hooks/useAssets";
import useDashboard from "hooks/useDashboard";
import { useMemo } from "react";
import { Row, Col } from "react-grid-system";
import { formatCurrency, formatDecimals, formatNumber } from "utils";

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled(Typography)``;
Label.defaultProps = {
  size: 16,
  weight: 900,
  color: "primary",
};

const Value = styled(Typography)``;
Value.defaultProps = {
  size: 22,
  weight: 900,
  color: "primary",
};

function ChangeRate({ value }: { value?: Numeric.Input }) {
  return value !== undefined ? (
    <Typography size={16} weight={900}>
      <ChangeRateFormatter rate={value} />
    </Typography>
  ) : null;
}

function PriceAndChangeRate({
  price,
  priceChange,
}: {
  price?: Numeric.Input;
  priceChange?: Numeric.Input;
}) {
  return (
    <Row justify="start" align="center" gutterWidth={6}>
      <Col xs="content">
        <Value>${formatNumber(formatDecimals(price || 0, 2))}</Value>
      </Col>
      <Col xs="content">
        <ChangeRate value={priceChange} />
      </Col>
    </Row>
  );
}

function TokenSummary({ tokenAddress }: { tokenAddress: string }) {
  const { getAsset } = useAssets();
  const { tokens } = useDashboard();

  const dashboardToken = useMemo(() => {
    return tokens?.find((token) => token.address === tokenAddress);
  }, [tokens, tokenAddress]);

  const asset = useMemo(() => {
    return tokenAddress ? getAsset(tokenAddress) : undefined;
  }, [tokenAddress, getAsset]);

  return (
    <Panel shadow>
      <Wrapper>
        <Label>Token Price</Label>
        <Row justify="between" align="center" gutterWidth={4}>
          <Col xs="content">
            <Row justify="start" align="center" gutterWidth={5}>
              <Col xs="content">
                <AssetIcon asset={{ icon: asset?.icon }} size={24} />
              </Col>
              <Col xs="content">
                <Typography size={16} weight={500} color="primary">
                  {asset?.name}
                </Typography>
              </Col>
            </Row>
          </Col>
          <Col xs="content">
            <PriceAndChangeRate
              price={dashboardToken?.price}
              priceChange={dashboardToken?.priceChange}
            />
          </Col>
        </Row>
        <Hr
          css={css`
            margin: 12px 0;
          `}
        />
        <Label>Trading Volume (24H)</Label>
        <PriceAndChangeRate
          price={dashboardToken?.volume24h}
          priceChange={dashboardToken?.volume24hChange}
        />
        <div />
        <Label>Trading Volume (7D)</Label>
        <PriceAndChangeRate
          price={dashboardToken?.volume7d}
          priceChange={dashboardToken?.volume7dChange}
        />
        <div />
        <Label>TVL</Label>
        <PriceAndChangeRate
          price={dashboardToken?.tvl}
          priceChange={dashboardToken?.tvlChange}
        />
        <div />
        <Label>Fees (24H)</Label>
        <PriceAndChangeRate price={dashboardToken?.fee} />
        <div />
      </Wrapper>
    </Panel>
  );
}

export default TokenSummary;
