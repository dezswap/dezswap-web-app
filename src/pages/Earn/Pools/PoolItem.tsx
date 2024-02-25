import { css } from "@emotion/react";
import { Numeric } from "@xpla/xpla.js";
import IconButton from "components/IconButton";
import Typography from "components/Typography";
import { LP_DECIMALS } from "constants/dezswap";
import useAssets from "hooks/useAssets";
import useBalance from "hooks/useBalance";
import useNetwork from "hooks/useNetwork";
import { useEffect, useMemo, useRef, useState } from "react";
import { Row, Col, useScreenClass, Hidden } from "react-grid-system";
import { formatNumber, formatDecimals, getAddressLink } from "utils";
import iconDefaultToken from "assets/icons/icon-default-token.svg";
import iconBookmark from "assets/icons/icon-bookmark-default.svg";
import iconBookmarkSelected from "assets/icons/icon-bookmark-selected.svg";
import styled from "@emotion/styled";
import Box from "components/Box";
import Button from "components/Button";
import { Link } from "react-router-dom";
import {
  LARGE_BROWSER_SCREEN_CLASS,
  MOBILE_SCREEN_CLASS,
  SMALL_BROWSER_SCREEN_CLASS,
  TABLET_SCREEN_CLASS,
} from "constants/layout";
import Tooltip from "components/Tooltip";
import usePairs from "hooks/usePairs";
import Outlink from "components/Outlink";
import SimplePieChart from "components/SimplePieChart";
import HoverUnderline from "components/utils/HoverUnderline";
import usePool from "hooks/usePool";
import useDashboard from "hooks/dashboard/useDashboard";
import CurrencyFormatter from "components/utils/CurrencyFormatter";
import AssetValueFormatter from "components/utils/AssetValueFormatter";
import PercentageFormatter from "components/utils/PercentageFormatter";
import Expand from "../Expand";

const TableRow = styled(Box)`
  min-width: 100%;
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  padding: 20px;
  background: none;
  gap: 20px;

  & > div {
    position: relative;
    width: 200px;
    min-width: 200px;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 16px;
    font-weight: 500;

    & > div {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      .${MOBILE_SCREEN_CLASS} &,
      .${TABLET_SCREEN_CLASS} & {
        overflow: unset;
        white-space: normal;
        text-overflow: unset;
        word-break: break-all;
      }
    }
  }

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    flex-direction: column;
    gap: 20px;

    & > div {
      width: 100%;
      &:first-of-type {
        width: 100%;
      }
    }
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
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 50%;
    background-image: ${({ src }) => `url(${src || iconDefaultToken})`};
    background-size: contain;
    background-repeat: no-repeat;
    background-position: 50% 50%;
  }
`;

const Label = styled(Typography)`
  line-height: 1;
  white-space: nowrap;
  margin-bottom: 15px;
  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    margin-bottom: 6px;
  }
`;

Label.defaultProps = {
  size: 14,
  weight: 900,
  color: "primary",
};

const BodyWrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  gap: 40px;

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    display: block;

    & > div {
      &:first-of-type {
        margin-bottom: 16px;
      }
    }
  }
`;

const BodyContent = styled(Box)`
  padding: 0;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.primary};

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    flex-direction: column;
  }
`;

const BodyContentInfo = styled(Box)`
  background-color: ${({ theme }) => theme.colors.white};

  .${SMALL_BROWSER_SCREEN_CLASS} &,
  .${LARGE_BROWSER_SCREEN_CLASS} & {
    padding-right: 30px;
  }

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    padding-bottom: 8px;
  }
`;
const BodyContentButtons = styled(Box)`
  background-color: ${({ theme }) => theme.colors.white};

  .${SMALL_BROWSER_SCREEN_CLASS} &,
  .${LARGE_BROWSER_SCREEN_CLASS} & {
    width: 166px;
    padding-left: 0;
  }

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    padding-top: 8px;
  }
`;

interface PoolItemProps {
  poolAddress: string;
  bookmarked?: boolean;
  onBookmarkClick?: React.MouseEventHandler<HTMLButtonElement>;
}

function PoolItem({ poolAddress, bookmarked, onBookmarkClick }: PoolItemProps) {
  const pool = usePool(poolAddress);
  const { pools: dashboardPools } = useDashboard();
  const dashboardPool = useMemo(
    () => dashboardPools?.find((item) => item.address === poolAddress),
    [dashboardPools, poolAddress],
  );
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const { getAsset } = useAssets();
  const network = useNetwork();
  const { getPair } = usePairs();
  const pair = useMemo(() => getPair(poolAddress), [getPair, poolAddress]);
  const lpBalance = useBalance(pair?.liquidity_token);

  const [asset1, asset2] = useMemo(
    () => pair?.asset_addresses.map((address) => getAsset(address)) || [],
    [getAsset, pair],
  );

  const userShare = useMemo(() => {
    return (
      Numeric.parse(lpBalance || "0")
        .dividedBy(pool?.total_share || "1")
        .toNumber() || 0
    );
  }, [lpBalance, pool]);

  const hasLiquidity = useMemo(() => {
    return Numeric.parse(lpBalance || "0").gt(0);
  }, [lpBalance]);

  const bookmarkButton = useMemo(
    () => (
      <IconButton
        key="bookmark"
        size={32}
        icons={{
          default: bookmarked ? iconBookmarkSelected : iconBookmark,
        }}
        onClick={(event) => {
          event.stopPropagation();
          onBookmarkClick?.(event);
        }}
      />
    ),
    [bookmarked, onBookmarkClick],
  );

  const [overflowActive, setOverflowActive] = useState(false);
  const textRef = useRef<Col & HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setOverflowActive(
        !!(
          textRef.current?.scrollWidth &&
          textRef.current?.scrollWidth > textRef.current.offsetWidth
        ),
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Expand
      header={
        <TableRow>
          <Hidden xs sm>
            <div style={{ width: 32, minWidth: 32, marginRight: -10 }}>
              {bookmarkButton}
            </div>
          </Hidden>
          <div style={{ minWidth: !isSmallScreen ? 244 : "100%" }}>
            {isSmallScreen && <Label>Pool</Label>}
            <Row justify="start" align="center" gutterWidth={6} wrap="nowrap">
              <Col
                width="auto"
                css={css`
                  white-space: nowrap;
                  line-height: 1;
                  font-size: 0;
                `}
              >
                <AssetIcon src={asset1?.icon} />
                <AssetIcon
                  src={asset2?.icon}
                  css={css`
                    margin-left: -9px;
                  `}
                />
              </Col>
              <Tooltip
                content={`${asset1?.symbol}-${asset2?.symbol}`}
                disabled={!overflowActive}
              >
                <Col
                  ref={textRef}
                  width="auto"
                  css={css`
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    padding: 2px 0;
                  `}
                >
                  <Link to={`/earn/pools/${encodeURIComponent(poolAddress)}`}>
                    <HoverUnderline>
                      {asset1?.symbol}-{asset2?.symbol}
                    </HoverUnderline>
                  </Link>
                </Col>
              </Tooltip>
              {isSmallScreen && (
                <Col width="auto" style={{ marginLeft: "auto" }}>
                  {bookmarkButton}
                </Col>
              )}
            </Row>
          </div>
          <div>
            {isSmallScreen && <Label>Total liquidity</Label>}
            <div>
              ${formatNumber(formatDecimals(dashboardPool?.tvl || "0", 2))}
            </div>
          </div>
          <div>
            {isSmallScreen && <Label>Volume(24h)</Label>}
            <div>
              <CurrencyFormatter value={dashboardPool?.volume} />
            </div>
          </div>
          <div>
            {isSmallScreen && <Label>Fees(24h)</Label>}
            <div>
              <CurrencyFormatter value={dashboardPool?.fee} />
            </div>
          </div>
          <div style={{ minWidth: !isSmallScreen ? 80 : "100%" }}>
            {isSmallScreen && <Label>APR</Label>}
            <div>
              {!Number.isNaN(Number(dashboardPool?.apr)) && (
                <PercentageFormatter
                  value={Numeric.parse(dashboardPool?.apr || 0).mul(100)}
                />
              )}
            </div>
          </div>
        </TableRow>
      }
    >
      <BodyWrapper>
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
            position: relative;
          `}
        >
          <BodyContent>
            <div
              css={css`
                width: 100%;
                position: relative;
                flex: 1;
                overflow-x: auto;
                overflow-y: hidden;
                &::-webkit-scrollbar-track {
                  margin-left: 16px;
                  margin-right: 10px;
                }
              `}
            >
              <BodyContentInfo>
                <Row
                  justify="start"
                  align="start"
                  gutterWidth={0}
                  wrap={!isSmallScreen ? "nowrap" : "wrap"}
                  style={{ columnGap: 20 }}
                  css={css`
                    min-width: 100%;
                    .${MOBILE_SCREEN_CLASS} &,
                    .${TABLET_SCREEN_CLASS} & {
                      width: 100%;
                      min-width: unset;
                      & > div {
                        margin-bottom: 16px;

                        &:first-of-type {
                          margin-bottom: 20px;
                        }
                        &:last-of-type {
                          margin-top: 4px;
                          margin-bottom: 0;
                        }
                      }
                    }
                  `}
                >
                  <Col
                    xs={12}
                    md="content"
                    css={css`
                      min-width: 260px;
                      .${MOBILE_SCREEN_CLASS} &,
                      .${TABLET_SCREEN_CLASS} & {
                        min-width: unset;
                      }
                    `}
                  >
                    <Label>Your Liquidity</Label>
                    <Typography
                      color="primary"
                      size={16}
                      weight={500}
                      css={css`
                        margin-bottom: 4px;
                      `}
                    >
                      $
                      {formatNumber(
                        formatDecimals(
                          Numeric.parse(userShare).mul(dashboardPool?.tvl || 0),
                          2,
                        ),
                      )}
                    </Typography>
                    <Typography color="text.secondary">
                      =&nbsp;
                      <AssetValueFormatter
                        asset={{ decimals: LP_DECIMALS, symbol: "LP" }}
                        amount={lpBalance}
                      />
                    </Typography>
                  </Col>
                  <Col
                    xs={12}
                    md="content"
                    css={css`
                      min-width: 260px;
                      .${MOBILE_SCREEN_CLASS} &,
                      .${TABLET_SCREEN_CLASS} & {
                        min-width: unset;
                      }
                    `}
                  >
                    <Label>Your Asset Pooled</Label>
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
                        amount={Numeric.parse(pool?.assets[0].amount || 0)
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
                        amount={Numeric.parse(pool?.assets[1].amount || 0)
                          .times(userShare)
                          .toFixed(0)}
                      />
                    </Typography>
                  </Col>
                  <Col
                    xs={12}
                    md="content"
                    css={css`
                      min-width: 132px;
                      .${MOBILE_SCREEN_CLASS} &,
                      .${TABLET_SCREEN_CLASS} & {
                        min-width: unset;
                      }
                    `}
                  >
                    <Label
                      css={css`
                        margin-bottom: 10px;
                      `}
                    >
                      Your Share
                    </Label>
                    <Row justify="start" align="center" gutterWidth={15}>
                      <Col xs="content">
                        <div
                          css={css`
                            width: 59px;
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
                  </Col>
                </Row>
              </BodyContentInfo>
            </div>
            <BodyContentButtons
              aria-hidden
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <Link
                to={`add-liquidity/${encodeURIComponent(poolAddress)}`}
                relative="route"
              >
                <Button
                  variant="primary"
                  block
                  css={css`
                    margin-bottom: 10px;
                  `}
                >
                  Add liquidity
                </Button>
              </Link>
              <Link
                to={`withdraw/${encodeURIComponent(poolAddress)}`}
                relative="route"
              >
                <Button variant="secondary" block disabled={!hasLiquidity}>
                  Remove liquidity
                </Button>
              </Link>
            </BodyContentButtons>
          </BodyContent>
        </div>
      </BodyWrapper>
    </Expand>
  );
}

export default PoolItem;
