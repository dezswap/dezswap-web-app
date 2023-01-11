import { css } from "@emotion/react";
import { Numeric } from "@xpla/xpla.js";
import IconButton from "components/IconButton";
import Typography from "components/Typography";
import { LP_DECIMALS } from "constants/dezswap";
import useAssets from "hooks/useAssets";
import { useBalance } from "hooks/useBalance";
import { useNetwork } from "hooks/useNetwork";
import { useMemo } from "react";
import { Row, Col } from "react-grid-system";
import {
  formatNumber,
  formatDecimals,
  amountToValue,
  getWalletLink,
} from "utils";
import iconDefaultToken from "assets/icons/icon-default-token.svg";
import iconBookmark from "assets/icons/icon-bookmark-default.svg";
import iconBookmarkSelected from "assets/icons/icon-bookmark-selected.svg";
import iconLink from "assets/icons/icon-link.svg";
import styled from "@emotion/styled";
import Box from "components/Box";
import Button from "components/Button";
import { Link } from "react-router-dom";
import Expand from "./Expand";
import { PoolExtended } from ".";

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

const TableRow = styled(Box)`
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
  padding: 14px 20px;
  background: none;
  & > div {
    width: 190px;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 16px;
    font-weight: 500;
    &:first-of-type {
      width: 244px;
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
    background-image: ${({ src }) => `url(${src || iconDefaultToken})`};
    background-size: contain;
    background-repeat: no-repeat;
    background-position: 50% 50%;
  }
`;

const Label = styled(Typography)`
  margin-bottom: 15px;
`;

const LinkButton = styled(Button.withComponent(Link))`
  text-decoration: none;
`;

Label.defaultProps = {
  size: 14,
  weight: 900,
  color: "primary",
};

const IconButtonAnchor = styled(IconButton.withComponent("a"))`
  cursor: pointer;
`;

interface PoolItemProps {
  pool: PoolExtended;
  bookmarked?: boolean;
  onBookmarkClick?: React.MouseEventHandler<HTMLButtonElement>;
}

function PoolItem({ pool, bookmarked, onBookmarkClick }: PoolItemProps) {
  const { getAsset } = useAssets();
  const network = useNetwork();
  const lpBalance = useBalance(pool.pair.liquidity_token);

  const [asset1, asset2] = useMemo(
    () => pool.pair.asset_addresses.map((address) => getAsset(address)),
    [getAsset, pool],
  );

  const userShare = useMemo(() => {
    return (
      Numeric.parse(lpBalance || "0")
        .dividedBy(pool.total_share || "1")
        .toNumber() || 0
    );
  }, [lpBalance, pool]);

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
            &nbsp;LP
          </div>
          <div>-</div>
          <div>-</div>
          <div>-</div>
        </TableRow>
      }
      extra={[
        <IconButton
          size={32}
          icons={{
            default: bookmarked ? iconBookmarkSelected : iconBookmark,
          }}
          onClick={onBookmarkClick}
        />,
        <IconButtonAnchor
          href={getWalletLink(pool.pair.contract_addr, network.name)}
          target="_blank"
          rel="noreferrer noopener"
          size={19}
          icons={{ default: iconLink }}
          css={css`
            margin-bottom: -3px;
          `}
        />,
      ]}
    >
      <Row justify="between" align="start" gutterWidth={0}>
        <Col width={360}>
          <Label
            css={css`
              margin-bottom: 10px;
            `}
          >
            Total Liquidity Ratio
          </Label>
          <Row justify="between" align="center" gutterWidth={10}>
            <Col width={80}>
              <div
                key={pool.pair.contract_addr}
                css={css`
                  width: 60px;
                  position: relative;
                  display: inline-block;
                `}
              >
                <SimplePieChart data={[50, 50]} />
              </div>
            </Col>
            <Col>
              <Typography color="secondary" size={16} weight={900}>
                {formatNumber(
                  formatDecimals(
                    amountToValue(pool.assets[0].amount, asset1?.decimals) ||
                      "0",
                    3,
                  ),
                )}
                &nbsp;
                {asset1?.symbol} (50%)
              </Typography>
              <Typography color="#00b1ff" size={16} weight={900}>
                {formatNumber(
                  formatDecimals(
                    amountToValue(pool.assets[1].amount, asset2?.decimals) ||
                      "0",
                    3,
                  ),
                )}
                &nbsp;
                {asset2?.symbol} (50%)
              </Typography>
            </Col>
          </Row>
        </Col>
        <Col width={210}>
          <Label>Your Liquidity</Label>
          <Typography color="primary" size={16} weight={500}>
            {formatNumber(
              formatDecimals(amountToValue(lpBalance, LP_DECIMALS) || "0", 3),
            )}
            &nbsp;LP
          </Typography>
        </Col>
        <Col width={210}>
          <Label>Asset Pooled</Label>
          <Typography color="primary" size={16} weight={500}>
            {formatNumber(
              formatDecimals(
                amountToValue(
                  Numeric.parse(pool.assets[0].amount)
                    .times(userShare)
                    .toString()
                    .split(".")[0],
                  asset1?.decimals,
                ) || "0",
                3,
              ),
            )}
            &nbsp;
            {asset1?.symbol}
            <br />
            {formatNumber(
              formatDecimals(
                amountToValue(
                  Numeric.parse(pool.assets[1].amount)
                    .times(userShare)
                    .toString()
                    .split(".")[0],
                  asset2?.decimals,
                ) || "0",
                3,
              ),
            )}
            &nbsp;
            {asset2?.symbol}
          </Typography>
        </Col>
        <Col width={80}>
          <Label>Your Share</Label>
          <Typography color="primary" size={16} weight={500}>
            {formatDecimals(userShare * 100, 2)}%
          </Typography>
        </Col>
        <Col
          width={150}
          aria-hidden
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <LinkButton
            to={`/pool/add-liquidity/${pool.pair.contract_addr}`}
            variant="primary"
            block
            css={css`
              margin-bottom: 10px;
            `}
          >
            Add liquidity
          </LinkButton>
          <LinkButton
            to={`/pool/withdraw/${pool.pair.contract_addr}`}
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
