import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Numeric } from "@xpla/xpla.js";
import AssetIcon from "components/AssetIcon";
import ChangeRateFormatter from "components/ChangeRateFormatter";
import Hr from "components/Hr";
import Panel from "components/Panel";
import Typography from "components/Typography";
import useAssets from "hooks/useAssets";
import { Row, Col } from "react-grid-system";
import { amountToValue, formatDecimals, formatNumber } from "utils";
import usePool from "hooks/usePool";
import { getAddressFromAssetInfo } from "utils/dezswap";
import usePoolData from "./usePoolData";

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

function PoolSummary({ poolAddress }: { poolAddress: string }) {
  const { getAsset } = useAssets();

  const dashboardPoolData = usePoolData(poolAddress);
  const pool = usePool(poolAddress);

  return (
    <Panel shadow>
      <Wrapper>
        <Label>Pool Liquidity</Label>
        <Value
          css={css`
            margin-bottom: 8px;
          `}
        >
          $
          {dashboardPoolData?.recent.tvl &&
            formatNumber(formatDecimals(dashboardPoolData?.recent.tvl, 2))}
        </Value>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 10px;
          `}
        >
          {pool?.assets?.map((poolAsset) => {
            const asset = getAsset(
              getAddressFromAssetInfo(poolAsset.info) || "",
            );
            return (
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
                  <Typography size={16} weight={500} color="primary">
                    {formatNumber(
                      amountToValue(poolAsset.amount, asset?.decimals) || 0,
                    )}
                  </Typography>
                </Col>
              </Row>
            );
          })}
        </div>
        <Hr
          css={css`
            margin: 12px 0;
          `}
        />
        <Label>Volume (24H)</Label>
        <PriceAndChangeRate
          price={dashboardPoolData?.recent.volume}
          priceChange={dashboardPoolData?.recent.volumeChangeRate}
        />
        <div />
        <Label>TVL</Label>
        <PriceAndChangeRate
          price={dashboardPoolData?.recent.tvl}
          priceChange={dashboardPoolData?.recent.tvlChangeRate}
        />
        <div />
        <Label>Fees (24H)</Label>
        <PriceAndChangeRate price={dashboardPoolData?.recent.fee} />
      </Wrapper>
    </Panel>
  );
}

export default PoolSummary;
