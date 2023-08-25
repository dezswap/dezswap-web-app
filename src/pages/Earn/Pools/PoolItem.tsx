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
import {
  formatNumber,
  formatDecimals,
  amountToValue,
  getAddressLink,
} from "utils";
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
import { Pool } from "types/api";
import usePairs from "hooks/usePairs";
import Outlink from "components/Outlink";
import Expand from "../Expand";

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
      const pieColors = [theme.colors.secondary, theme.colors.selected];
      return `conic-gradient(${data
        .map((d, i) => `${pieColors[i]} ${d}%`)
        .join(", ")})`;
    }};
    border-radius: 50%;
  }
`;

const TableRow = styled(Box)`
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  padding: 20px;
  background: none;
  gap: 20px;

  & > div {
    position: relative;
    width: 190px;
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

const LinkButton = styled(Button.withComponent(Link), {
  shouldForwardProp: (prop) => prop !== "block",
})`
  text-decoration: none;
  white-space: nowrap;
  text-align: center;
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
  pool: Pool;
  bookmarked?: boolean;
  onBookmarkClick?: React.MouseEventHandler<HTMLButtonElement>;
}

function PoolItem({ pool, bookmarked, onBookmarkClick }: PoolItemProps) {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const { getAsset } = useAssets();
  const network = useNetwork();
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
            <div style={{ width: 32, marginRight: -10 }}>{bookmarkButton}</div>
          </Hidden>
          <div style={{ width: !isSmallScreen ? 244 : "100%" }}>
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
                  `}
                >
                  {asset1?.symbol}-{asset2?.symbol}
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
              {formatNumber(
                formatDecimals(
                  amountToValue(pool.total_share, LP_DECIMALS) || "",
                  2,
                ),
              )}
              &nbsp;LP
            </div>
          </div>
          <div>
            {isSmallScreen && <Label>Volume(24h)</Label>}
            <div>-</div>
          </div>
          <div>
            {isSmallScreen && <Label>Fees(24h)</Label>}
            <div>-</div>
          </div>
          <div>
            {isSmallScreen && <Label>APR</Label>}
            <div>-</div>
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
                    <Typography color="primary" size={16} weight={500}>
                      {formatNumber(
                        formatDecimals(
                          amountToValue(lpBalance, LP_DECIMALS) || "0",
                          3,
                        ),
                      )}
                      &nbsp;LP
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
                    <Label>Asset Pooled</Label>
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
                          {formatDecimals(userShare * 100, 2)}%
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
              <LinkButton
                to={`add-liquidity/${pool.address}`}
                relative="route"
                variant="primary"
                block
                css={css`
                  margin-bottom: 10px;
                `}
              >
                Add liquidity
              </LinkButton>
              <LinkButton
                to={`withdraw/${pool.address}`}
                relative="route"
                variant="secondary"
                block
              >
                Remove liquidity
              </LinkButton>
            </BodyContentButtons>
          </BodyContent>
        </div>
      </BodyWrapper>
    </Expand>
  );
}

export default PoolItem;
