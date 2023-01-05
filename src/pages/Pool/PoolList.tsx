import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Box from "components/Box";
import useAssets from "hooks/useAssets";
import iconDefaultToken from "assets/icons/icon-default-token.svg";
import { Col, Row } from "react-grid-system";
import { amountToValue, formatDecimals, formatNumber } from "utils";
import { LP_DECIMALS } from "constants/dezswap";
import Expand from "./Expand";
import { PoolWithPair } from ".";

interface PoolListProps {
  pools: PoolWithPair[];
}

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;

  /* & > div {
    width: auto;
    min-width: 100%;
  } */
`;

const SimplePieChart = styled.div<{ data: number[] }>`
  width: 100%;
  height: 0;
  position: relative;
  padding-bottom: 100%;

  &::after {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-image: ${({ data, theme }) => {
      const pieColors = [theme.colors.secondary, "#00b1ff"];
      return `conic-gradient(${data
        .map((d, i) => `${pieColors[i]} ${d}%`)
        .join(", ")})`;
    }};
    border-radius: 50%;
  }
`;

const TableHeader = styled(Box)`
  /* width: auto;
  min-width: 100%; */
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
  padding: 14px 20px;
  & > div {
    width: 190px;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 14px;
    font-weight: 900;
    &:first-of-type {
      width: 244px;
    }
  }
`;

const TableRow = styled(TableHeader)`
  background: unset;
  & > div {
    font-size: 16px;
    font-weight: 500;
  }
`;

const AssetIcon = styled.div<{ src?: string }>`
  width: 32px;
  height: 32px;
  position: relative;
  display: inline-block;
  &::after {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-image: ${({ src }) => `url(${src || iconDefaultToken})`};
    background-size: contain;
    background-repeat: no-repeat;
    background-position: 50% 50%;
  }
`;

const PoolItem = styled(Box)``;

function PoolList({ pools }: PoolListProps) {
  const { getAsset } = useAssets();
  return (
    <Wrapper>
      <TableHeader>
        <div>Pool</div>
        <div>Total Liquidity</div>
        <div>Volume(24H)</div>
        <div>Fees(24H)</div>
        <div>APR</div>
      </TableHeader>

      {pools.map((pool) => {
        const [asset1, asset2] = pool.pair.asset_addresses.map((address) =>
          getAsset(address),
        );
        return (
          <Expand
            header={
              <TableRow>
                <div>
                  <Row justify="start" align="center" gutterWidth={6}>
                    <Col width="auto">
                      <AssetIcon src={asset1?.iconSrc} />
                      <AssetIcon
                        src={asset2?.iconSrc}
                        css={css`
                          margin-left: -9px;
                        `}
                      />
                    </Col>
                    <Col>
                      {asset1?.symbol}-{asset2?.symbol}
                    </Col>
                  </Row>
                </div>
                <div>
                  {formatNumber(
                    formatDecimals(
                      amountToValue(pool.total_share, LP_DECIMALS) || "",
                      2,
                    ),
                  )}
                </div>
                <div>-</div>
                <div>-</div>
                <div>-</div>
              </TableRow>
            }
            extra={[<div>1</div>, <div>2</div>]}
          >
            <div
              key={pool.pair.contract_addr}
              css={css`
                width: 120px;
                position: relative;
                display: inline-block;
              `}
            >
              <SimplePieChart data={[50, 50]} />
            </div>
          </Expand>
        );
      })}
    </Wrapper>
  );
}

export default PoolList;