import { Numeric } from "@xpla/xpla.js";
import Box from "components/Box";
import { Col, Row } from "react-grid-system";
import { Pool } from "types/api";

import iconBookmark from "assets/icons/icon-bookmark-default.svg";
import iconBookmarkSelected from "assets/icons/icon-bookmark-selected.svg";
import IconButton from "components/IconButton";
import AssetIcon from "components/AssetIcon";
import useAssets from "hooks/useAssets";
import { useMemo } from "react";
import { css } from "@emotion/react";
import Hr from "components/Hr";
import Outlink from "components/Outlink";
import usePairs from "hooks/usePairs";
import {
  amountToValue,
  formatDecimals,
  formatNumber,
  getAddressLink,
} from "utils";
import useNetwork from "hooks/useNetwork";
import styled from "@emotion/styled";
import Button from "components/Button";
import Typography from "components/Typography";
import useBalance from "hooks/useBalance";
import { LP_DECIMALS } from "constants/dezswap";
import SimplePieChart from "components/SimplePieChart";

interface PoolItemProps {
  pool: Pool;
  isBookmarked?: boolean;
  onBookmarkClick?: (pool: Pool) => void;
}

const Content = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: start;

  column-gap: 50px;
`;

const InnerBox = styled(Box)`
  padding: 0 16px;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.primary};

  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 30px;

  & > div {
    padding: 16px 0;
  }
`;

function PoolItem({
  pool,
  isBookmarked,
  onBookmarkClick: handleBookmarkClick,
}: PoolItemProps) {
  const network = useNetwork();
  const { getAsset } = useAssets();
  const { getPair } = usePairs();
  const pair = useMemo(() => getPair(pool.address), [getPair, pool]);
  const lpBalance = useBalance(pair?.liquidity_token);

  const [asset1, asset2] = useMemo(
    () => pair?.asset_addresses.map((address) => getAsset(address)) || [],
    [getAsset, pair],
  );

  const userShare = useMemo(() => {
    return (
      Numeric.parse(lpBalance || "0")
        .dividedBy(pool.total_share || "1")
        .toNumber() || 0
    );
  }, [lpBalance, pool]);

  return (
    <Box>
      <Row
        justify="start"
        align="center"
        gutterWidth={10}
        css={css`
          margin-bottom: 19px;
        `}
      >
        <Col xs="content">
          <IconButton
            size={32}
            style={{ alignItems: "center" }}
            icons={{
              default: isBookmarked ? iconBookmarkSelected : iconBookmark,
            }}
            onClick={(event) => {
              event.stopPropagation();
              if (handleBookmarkClick) {
                handleBookmarkClick(pool);
              }
            }}
          />
        </Col>
        <Col
          xs="content"
          css={css`
            font-size: 0;
          `}
        >
          {[asset1, asset2].map((asset, index) => (
            <div
              css={css`
                display: inline-block;
              `}
              style={{ marginLeft: -10 * index }}
            >
              <AssetIcon key={asset?.token} asset={{ icon: asset?.icon }} />
            </div>
          ))}
        </Col>
        <Col xs="content">
          <Typography size={16} weight={500} color="primary">
            {asset1?.symbol}-{asset2?.symbol}
          </Typography>
        </Col>
      </Row>
      <Hr
        css={css`
          margin-bottom: 20px;
        `}
      />
      <Content>
        <div>
          <Outlink
            href={
              pair?.contract_addr
                ? getAddressLink(pair?.contract_addr, network.name)
                : "#"
            }
          >
            Pair info
          </Outlink>
        </div>
        <div
          css={css`
            flex: 1;
          `}
        >
          <InnerBox>
            <div
              css={css`
                position: relative;
                flex: 1 1 auto;
                overflow-x: auto;
                overflow-y: hidden;
                max-width: 746px;

                display: flex;
                justify-content: flex-start;
                align-items: flex-start;
                gap: 20px;

                & > div {
                  flex: 1;
                }
              `}
            >
              <div>
                <Typography
                  color="primary"
                  weight={900}
                  size={14}
                  css={css`
                    margin-bottom: 15px;
                  `}
                >
                  Your Liquidity
                </Typography>
                <Typography
                  color="primary"
                  weight={500}
                  size={16}
                  css={css`
                    margin-bottom: 4px;
                  `}
                >
                  $TBD
                </Typography>
                <Typography color="text.secondary" weight={500} size={14}>
                  =&nbsp;
                  {formatNumber(
                    formatDecimals(
                      amountToValue(lpBalance, LP_DECIMALS) || "0",
                      2,
                    ),
                  )}
                  &nbsp;LP
                </Typography>
              </div>
              <div>
                <Typography
                  color="primary"
                  weight={900}
                  size={14}
                  css={css`
                    margin-bottom: 15px;
                  `}
                >
                  Your Asset Pooled
                </Typography>
                <Typography
                  color="primary"
                  size={16}
                  weight={500}
                  css={css`
                    white-space: nowrap;
                    margin-bottom: 4px;
                  `}
                >
                  {formatNumber(
                    formatDecimals(
                      amountToValue(
                        Numeric.parse(pool.assets[0].amount)
                          .times(userShare)
                          .toFixed(0),
                        asset1?.decimals,
                      ) || "0",
                      3,
                    ),
                  )}
                  &nbsp;
                  {asset1?.symbol}
                </Typography>
                <Typography
                  color="primary"
                  size={16}
                  weight={500}
                  css={css`
                    white-space: nowrap;
                  `}
                >
                  {formatNumber(
                    formatDecimals(
                      amountToValue(
                        Numeric.parse(pool.assets[1].amount)
                          .times(userShare)
                          .toFixed(0),
                        asset2?.decimals,
                      ) || "0",
                      3,
                    ),
                  )}
                  &nbsp;
                  {asset2?.symbol}
                </Typography>
              </div>
              <div
                css={css`
                  max-width: 186px;
                `}
              >
                <Typography
                  color="primary"
                  weight={900}
                  size={14}
                  css={css`
                    margin-bottom: 10px;
                  `}
                >
                  Your Share
                </Typography>
                <Row justify="start" align="center" gutterWidth={0}>
                  <Col xs="content">
                    <div
                      css={css`
                        width: 59px;
                        margin-right: 15px;
                      `}
                    >
                      <SimplePieChart data={[userShare * 100, 0]} />
                    </div>
                  </Col>
                  <Col>
                    <Typography color="secondary" size={16} weight={900}>
                      {formatDecimals(userShare * 100, 2)}%
                    </Typography>
                  </Col>
                </Row>
              </div>
            </div>
            <div
              css={css`
                flex: 0 0 150px;
                display: flex;
                flex-direction: column;
                gap: 10px;
              `}
            >
              <Button variant="primary" block>
                Add liquidity
              </Button>
              <Button variant="secondary" block>
                Remove Liquidity
              </Button>
            </div>
          </InnerBox>
        </div>
      </Content>
    </Box>
  );
}

export default PoolItem;
