import { Numeric } from "@xpla/xpla.js";
import Box from "components/Box";
import { Col, Row, useScreenClass } from "react-grid-system";
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
import { formatDecimals, formatNumber, getAddressLink } from "utils";
import useNetwork from "hooks/useNetwork";
import styled from "@emotion/styled";
import Button from "components/Button";
import Typography from "components/Typography";
import useBalance from "hooks/useBalance";
import { LP_DECIMALS } from "constants/dezswap";
import SimplePieChart from "components/SimplePieChart";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import Expand from "pages/Earn/Expand";
import useDashboardPoolDetail from "hooks/dashboard/useDashboardPoolDetail";
import HoverUnderline from "components/utils/HoverUnderline";
import AssetValueFormatter from "components/utils/AssetValueFormatter";
import PercentageFormatter from "components/utils/PercentageFormatter";
import Link from "components/Link";

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

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    flex-direction: column;
    row-gap: 16px;
    flex: 1;

    & > div {
      width: 100%;
    }
  }
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
    .${MOBILE_SCREEN_CLASS} &,
    .${TABLET_SCREEN_CLASS} & {
      width: 100%;

      display: flex;
      justify-content: space-between;
      align-items: start;
      flex-direction: column;
      row-gap: 16px;

      & > div {
        width: 100%;
      }
    }
  }
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

function PoolItem({
  pool,
  isBookmarked,
  onBookmarkClick: handleBookmarkClick,
}: PoolItemProps) {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const {
    chainName,
    selectedChain: { explorers },
  } = useNetwork();
  const { getAsset } = useAssets();
  const { getPair } = usePairs();
  const pair = useMemo(() => getPair(pool.address), [getPair, pool]);
  const lpBalance = useBalance(pair?.liquidity_token);
  const dashboardPoolDetail = useDashboardPoolDetail(pool.address);

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

  const bookmarkButton = useMemo(
    () => (
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
    ),
    [handleBookmarkClick, isBookmarked, pool],
  );

  const assetIconAndName = useMemo(
    () => (
      <Row justify="start" align="center" gutterWidth={10} wrap="nowrap">
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
        <Col
          css={css`
            min-width: 0;
          `}
        >
          <Link to={`/earn/pools/${pool.address}`}>
            <HoverUnderline>
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
                {asset1?.symbol}-{asset2?.symbol}
              </Typography>
            </HoverUnderline>
          </Link>
        </Col>
      </Row>
    ),
    [asset1, asset2],
  );

  const pairInfoOutlink = useMemo(
    () => (
      <Outlink
        href={
          pair?.contract_addr
            ? getAddressLink(pair?.contract_addr, explorers?.[0].url)
            : "#"
        }
      >
        Pair info
      </Outlink>
    ),
    [chainName, pair?.contract_addr],
  );

  const userLiquidity = useMemo(
    () => (
      <>
        <Typography
          color="primary"
          weight={500}
          size={16}
          css={css`
            margin-bottom: 4px;
          `}
        >
          $
          {dashboardPoolDetail?.recent.tvl &&
            formatNumber(
              formatDecimals(
                Numeric.parse(userShare).mul(dashboardPoolDetail?.recent.tvl),
                2,
              ),
            )}
        </Typography>
        <Typography color="text.secondary" weight={500} size={14}>
          =&nbsp;
          <AssetValueFormatter
            asset={{ decimals: LP_DECIMALS, symbol: "LP" }}
            amount={lpBalance}
          />
        </Typography>
      </>
    ),
    [dashboardPoolDetail, lpBalance, userShare],
  );

  const assetPooled = useMemo(
    () => (
      <>
        <Typography
          color="primary"
          size={16}
          weight={500}
          css={css`
            white-space: nowrap;
            margin-bottom: 4px;
          `}
        >
          <AssetValueFormatter
            asset={asset1}
            amount={Numeric.parse(pool.assets[0].amount)
              .times(userShare)
              .toFixed(0)}
          />
        </Typography>
        <Typography
          color="primary"
          size={16}
          weight={500}
          css={css`
            white-space: nowrap;
          `}
        >
          <AssetValueFormatter
            asset={asset2}
            amount={Numeric.parse(pool.assets[1].amount)
              .times(userShare)
              .toFixed(0)}
          />
        </Typography>
      </>
    ),
    [asset1, asset2, pool, userShare],
  );

  const pieChart = useMemo(
    () => (
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
            <PercentageFormatter value={userShare * 100} />
          </Typography>
        </Col>
      </Row>
    ),
    [userShare],
  );

  const actionButtons = useMemo(
    () => (
      <>
        <Link to={`${encodeURIComponent(pool.address)}/add`}>
          <Button variant="primary" block>
            Add liquidity
          </Button>
        </Link>

        <Link to={`${encodeURIComponent(pool.address)}/remove`}>
          <Button variant="secondary" block>
            Remove liquidity
          </Button>
        </Link>
      </>
    ),
    [pool],
  );

  return isSmallScreen ? (
    <Expand
      header={
        <Content
          css={css`
            padding: 20px;
          `}
        >
          <div>
            <Label>Pool</Label>
            <Row
              justify="between"
              align="center"
              wrap="nowrap"
              gutterWidth={10}
            >
              <Col
                css={css`
                  min-width: 0;
                `}
              >
                {assetIconAndName}
              </Col>
              <Col xs="content">{bookmarkButton}</Col>
            </Row>
          </div>
        </Content>
      }
    >
      <Content>
        {pairInfoOutlink}
        <InnerBox>
          <div>
            <div>
              <Label>Your Liquidity</Label>
              {userLiquidity}
            </div>
            <div>
              <Label>Asset Pooled</Label>
              {assetPooled}
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
              {pieChart}
            </div>
            <div
              css={css`
                display: flex;
                flex-direction: column;
                gap: 10px;
              `}
            >
              {actionButtons}
            </div>
          </div>
        </InnerBox>
      </Content>
    </Expand>
  ) : (
    <Box>
      <Row
        justify="start"
        align="center"
        gutterWidth={10}
        css={css`
          margin-bottom: 19px;
        `}
      >
        <Col xs="content">{bookmarkButton}</Col>
        <Col xs="content">{assetIconAndName}</Col>
      </Row>
      <Hr
        css={css`
          margin-bottom: 20px;
        `}
      />
      <Content>
        <div>{pairInfoOutlink}</div>
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
                {userLiquidity}
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
                {assetPooled}
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
                {pieChart}
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
              {actionButtons}
            </div>
          </InnerBox>
        </div>
      </Content>
    </Box>
  );
}

export default PoolItem;
