import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Numeric } from "@xpla/xpla.js";
import AssetIcon from "components/AssetIcon";
import HoverUnderline from "components/utils/HoverUnderline";
import Typography from "components/Typography";
import useAssets from "hooks/useAssets";
import useModal from "hooks/useModal";
import usePairs from "hooks/usePairs";
import Expand from "pages/Earn/Expand";
import { useMemo } from "react";
import { Row, Col } from "react-grid-system";
import { DashboardPool } from "types/dashboard-api";
import CurrencyFormatter from "components/utils/CurrencyFormatter";
import PercentageFormatter from "components/utils/PercentageFormatter";
import Link from "components/Link";

interface MobilePoolItemProps {
  pool: DashboardPool;
  number: number;
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

function MobilePoolItem({ pool, number }: MobilePoolItemProps) {
  const expand = useModal();
  const { assetInfos } = useAssets();
  const { getPair } = usePairs();
  const pair = useMemo(() => getPair(pool.address), [pool, getPair]);

  const assets = useMemo(() => {
    return pair?.asset_addresses.map((address) => {
      return assetInfos?.[address];
    });
  }, [assetInfos, pair]);

  return (
    <Expand
      isOpen={expand.isOpen}
      onHeaderClick={() => expand.toggle()}
      hasDivider={false}
      header={
        <Content
          css={css`
            padding: 20px;
          `}
        >
          <div>
            <Label>Pool</Label>
            <Value>
              <Row
                justify="start"
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
                  {assets?.map((asset, index) => (
                    <div
                      key={asset?.token}
                      css={css`
                        display: inline-block;
                      `}
                      style={{ marginLeft: -10 * index }}
                    >
                      <AssetIcon
                        key={asset?.token}
                        asset={{ icon: asset?.icon }}
                      />
                    </div>
                  ))}
                </Col>
                <Col
                  css={css`
                    min-width: 0;
                  `}
                >
                  <HoverUnderline>
                    <Link
                      to={`/earn/pools/${pool.address}`}
                      css={css`
                        max-width: 100%;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                      `}
                    >
                      <Typography
                        size={16}
                        weight={500}
                        color="primary"
                        css={css`
                          max-width: 100%;
                          overflow: hidden;
                          white-space: nowrap;
                          text-overflow: ellipsis;
                        `}
                      >
                        {assets?.map((asset) => asset?.symbol).join("-")}
                      </Typography>{" "}
                    </Link>
                  </HoverUnderline>
                </Col>
              </Row>
            </Value>
          </div>
          {expand.isOpen && (
            <div>
              <Label>TVL</Label>
              <Value>
                <CurrencyFormatter value={pool.tvl} />
              </Value>
            </div>
          )}
          <div>
            <Label>Volume 24H</Label>
            <Value>
              <CurrencyFormatter value={pool.volume} />
            </Value>
          </div>
        </Content>
      }
    >
      <Content>
        <div>
          <Label>Fees 24H</Label>
          <Value>
            <CurrencyFormatter value={pool.fee} />
          </Value>
        </div>
        <div>
          <Label>APR 7D</Label>
          <Value>
            {!Number.isNaN(Number(pool.apr)) && (
              <PercentageFormatter value={Numeric.parse(pool.apr).mul(100)} />
            )}
          </Value>
        </div>
      </Content>
    </Expand>
  );
}

export default MobilePoolItem;
