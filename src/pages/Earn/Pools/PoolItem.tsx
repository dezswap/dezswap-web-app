import { css } from "@emotion/react";
import { Numeric } from "@xpla/xpla.js";
import IconButton from "components/IconButton";
import Typography from "components/Typography";
import { LP_DECIMALS } from "constants/dezswap";
import useAssets from "hooks/useAssets";
import useBalance from "hooks/useBalance";
import useNetwork from "hooks/useNetwork";
import { useEffect, useMemo, useRef, useState } from "react";
import { Row, Col, useScreenClass } from "react-grid-system";
import {
  formatNumber,
  formatDecimals,
  amountToValue,
  getAddressLink,
} from "utils";
import iconDefaultToken from "assets/icons/icon-default-token.svg";
import iconBookmark from "assets/icons/icon-bookmark-default.svg";
import iconBookmarkSelected from "assets/icons/icon-bookmark-selected.svg";
import iconLink from "assets/icons/icon-link.svg";
import styled from "@emotion/styled";
import Box from "components/Box";
import Button from "components/Button";
import { Link } from "react-router-dom";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import Tooltip from "components/Tooltip";
import { Pool } from "types/api";
import usePairs from "hooks/usePairs";
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
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  padding: 20px;
  background: none;
  & > div {
    width: 190px;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 16px;
    font-weight: 500;
    &:first-of-type {
      width: 244px;
    }

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

const IconButtonAnchor = styled(IconButton.withComponent("a"))`
  cursor: pointer;
  display: inline-block;
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

  const extra = useMemo(
    () => [
      <IconButton
        key="bookmark"
        size={32}
        icons={{
          default: bookmarked ? iconBookmarkSelected : iconBookmark,
        }}
        onClick={onBookmarkClick}
      />,
      <IconButtonAnchor
        key="link"
        href={
          pair?.contract_addr
            ? getAddressLink(pair?.contract_addr, network.name)
            : "#"
        }
        target="_blank"
        rel="noreferrer noopener"
        size={19}
        icons={{ default: iconLink }}
        css={css`
          margin-bottom: -2px;
        `}
      />,
    ],
    [bookmarked, network, onBookmarkClick, pair],
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
          <div>
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
                arrow
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
                  <Row
                    justify="end"
                    align="center"
                    gutterWidth={4}
                    aria-hidden
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    wrap="nowrap"
                  >
                    {extra.map((item) => (
                      <Col key={item.key}>{item}</Col>
                    ))}
                  </Row>
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
      extra={!isSmallScreen ? extra : undefined}
    >
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
          `}
        >
          <Label>Pool Composition</Label>
          <Row justify="start" align="center" gutterWidth={10} wrap="nowrap">
            <Col width="auto" style={{ flex: 1 }}>
              <Typography
                color="primary"
                size={16}
                weight={500}
                css={css`
                  margin-bottom: 4px;
                `}
              >
                {formatNumber(
                  formatDecimals(
                    amountToValue(pool.assets[0].amount, asset1?.decimals) ||
                      "0",
                    3,
                  ),
                )}
                &nbsp;
                {asset1?.symbol}
              </Typography>
              <Typography color="primary" size={16} weight={500}>
                {formatNumber(
                  formatDecimals(
                    amountToValue(pool.assets[1].amount, asset2?.decimals) ||
                      "0",
                    3,
                  ),
                )}
                &nbsp;
                {asset2?.symbol}
              </Typography>
            </Col>
          </Row>
        </Col>
        <Col
          xs={12}
          md="content"
          css={css`
            min-width: 200px;
          `}
        >
          <Label>Your Liquidity</Label>
          <Typography color="primary" size={16} weight={500}>
            {formatNumber(
              formatDecimals(amountToValue(lpBalance, LP_DECIMALS) || "0", 3),
            )}
            &nbsp;LP
          </Typography>
        </Col>
        <Col
          xs={12}
          md="content"
          css={css`
            min-width: 200px;
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
        <Col
          xs={12}
          md="content"
          aria-hidden
          onClick={(event) => {
            event.stopPropagation();
          }}
          style={{ marginLeft: "auto" }}
        >
          <LinkButton
            to={`/pool/add-liquidity/${pool.address}`}
            variant="primary"
            block
            css={css`
              margin-bottom: 10px;
            `}
          >
            Add liquidity
          </LinkButton>
          <LinkButton
            to={`/pool/withdraw/${pool.address}`}
            variant="secondary"
            block
          >
            Remove liquidity
          </LinkButton>
        </Col>
      </Row>
    </Expand>
  );
}

export default PoolItem;
