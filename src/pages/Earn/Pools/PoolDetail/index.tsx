import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { AccAddress, Numeric } from "@xpla/xpla.js";
import Breadcrumb from "components/Breadcrumb";
import Hr from "components/Hr";
import IconButton from "components/IconButton";
import Panel from "components/Panel";
import useInvalidPathModal from "hooks/modals/useInvalidPathModal";
import useAssets from "hooks/useAssets";
import { useEffect, useMemo } from "react";
import { Col, Container, Row, useScreenClass } from "react-grid-system";
import { Link, useNavigate, useParams } from "react-router-dom";

import iconBookmark from "assets/icons/icon-bookmark-default.svg";
import iconBookmarkSelected from "assets/icons/icon-bookmark-selected.svg";
import AssetIcon from "components/AssetIcon";
import Typography from "components/Typography";
import Outlink from "components/Outlink";
import {
  amountToValue,
  formatDecimals,
  formatNumber,
  getAddressLink,
  getIbcTokenHash,
  isNativeTokenAddress,
} from "utils";
import useNetwork from "hooks/useNetwork";
import Button from "components/Button";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import useBalance from "hooks/useBalance";
import useVerifiedAssets from "hooks/useVerifiedAssets";
import usePairBookmark from "hooks/usePairBookmark";
import usePairs from "hooks/usePairs";
import { LP_DECIMALS } from "constants/dezswap";
import usePool from "hooks/usePool";
import useDashboardPoolDetail from "hooks/dashboard/useDashboardPoolDetail";
import Chart from "./Chart";
import PoolSummary from "./PoolSummary";
import PoolTransactions from "./PoolTransactions";
import PoolValueButton from "./PoolValueButton";

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
`;

function PoolDetailPage() {
  const screenClass = useScreenClass();
  const network = useNetwork();
  const navigate = useNavigate();
  const { poolAddress } = useParams<{ poolAddress: string }>();
  const { bookmarks, toggleBookmark } = usePairBookmark();
  const invalidPathModal = useInvalidPathModal({
    onReturnClick() {
      navigate("..", { replace: true, relative: "route" });
    },
  });

  const { getPair } = usePairs();
  const pool = usePool(poolAddress);
  const pair = useMemo(() => {
    return poolAddress ? getPair(poolAddress) : undefined;
  }, [poolAddress, getPair]);

  const { getAsset } = useAssets();
  const dashboardPoolData = useDashboardPoolDetail(poolAddress || "");

  const [asset0, asset1] = useMemo(() => {
    return pair?.asset_addresses.map((address) => getAsset(address)) || [];
  }, [getAsset, pair]);

  const poolName = useMemo(() => {
    return [asset0?.name, asset1?.name].join("-");
  }, [asset0, asset1]);

  const isBookmarked = useMemo(() => {
    return poolAddress ? bookmarks?.includes(poolAddress) : false;
  }, [bookmarks, poolAddress]);

  const lpBalance = useBalance(pair?.liquidity_token || "");

  const userShare = useMemo(() => {
    return pool
      ? Numeric.parse(lpBalance || "0")
          .dividedBy(pool.total_share || "1")
          .toNumber() || 0
      : 0;
  }, [lpBalance, pool]);

  const bookmarkButton = useMemo(
    () => (
      <IconButton
        size={32}
        style={{ alignItems: "center" }}
        icons={{
          default: isBookmarked ? iconBookmarkSelected : iconBookmark,
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (poolAddress) {
            toggleBookmark(poolAddress);
          }
        }}
      />
    ),
    [isBookmarked, poolAddress, toggleBookmark],
  );

  const poolValueButton = useMemo(
    () => (poolAddress ? <PoolValueButton poolAddress={poolAddress} /> : null),
    [poolAddress],
  );

  const { verifiedIbcAssets } = useVerifiedAssets();

  useEffect(() => {
    if (
      verifiedIbcAssets &&
      (!poolAddress ||
        (!AccAddress.validate(poolAddress) &&
          !isNativeTokenAddress(network.name, poolAddress) &&
          !verifiedIbcAssets?.[getIbcTokenHash(poolAddress)]))
    ) {
      invalidPathModal.open();
    }
  }, [invalidPathModal, network, poolAddress, verifiedIbcAssets]);

  return (
    <Wrapper>
      <Container>
        <div
          css={css`
            margin-bottom: 19px;
          `}
        >
          <Breadcrumb
            items={[
              { label: "Home", to: "/" },
              { label: "Earn", to: "/earn" },
              { label: "Pools", to: "/earn/pools" },
              {
                label: poolName,
                to: `/earn/pools/${poolAddress}`,
              },
            ]}
          />
        </div>
        <div
          css={css`
            margin-bottom: 20px;
          `}
        >
          <Hr />
        </div>
        <Panel
          shadow
          css={css`
            margin-bottom: 13px;
          `}
        >
          <Row
            justify="between"
            align="center"
            css={css`
              row-gap: 10px;
            `}
          >
            <Col xs={12} sm="content">
              <Row justify="between" align="center">
                <Col>
                  <Row
                    justify="start"
                    align="center"
                    gutterWidth={screenClass === MOBILE_SCREEN_CLASS ? 6 : 10}
                  >
                    {screenClass !== MOBILE_SCREEN_CLASS && (
                      <Col xs="content">{bookmarkButton}</Col>
                    )}
                    <Col xs="content">
                      {[asset0, asset1]?.map((asset, index) => (
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
                    <Col xs="content">
                      <Typography
                        size={screenClass === MOBILE_SCREEN_CLASS ? 16 : 26}
                        weight={900}
                        color="primary"
                      >
                        {poolName}
                      </Typography>
                    </Col>
                    <Col xs="content">
                      <Outlink
                        iconSize={19}
                        href={getAddressLink(poolAddress, network.name)}
                      />
                    </Col>
                    {screenClass !== MOBILE_SCREEN_CLASS && (
                      <Col xs="content">
                        <div
                          css={css`
                            padding-left: 10px;
                          `}
                        >
                          {poolValueButton}
                        </div>
                      </Col>
                    )}
                  </Row>
                </Col>
                {screenClass === MOBILE_SCREEN_CLASS && (
                  <Col xs="content">{bookmarkButton}</Col>
                )}
              </Row>
            </Col>
            {screenClass === MOBILE_SCREEN_CLASS && (
              <Col
                xs={12}
                css={css`
                  margin-bottom: 10px;
                `}
              >
                {poolValueButton}
              </Col>
            )}
            <Col xs={12} sm={4}>
              <div
                css={
                  screenClass !== MOBILE_SCREEN_CLASS &&
                  css`
                    max-width: 310px;
                    margin-left: auto;
                  `
                }
              >
                <Row justify="between" align="center" gutterWidth={10}>
                  <Col xs={6}>
                    <Link to={`/earn/pools/add-liquidity/${poolAddress}`}>
                      <Button variant="primary" block>
                        {screenClass === MOBILE_SCREEN_CLASS
                          ? "Add"
                          : "Add liquidity"}
                      </Button>
                    </Link>
                  </Col>
                  <Col xs={6}>
                    <Link to={`/earn/pools/withdraw/${poolAddress}`}>
                      <Button variant="secondary" block>
                        {screenClass === MOBILE_SCREEN_CLASS
                          ? "Remove"
                          : "Remove liquidity"}
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          {Numeric.parse(lpBalance).gt(0) && (
            <>
              <Hr
                css={css`
                  margin: 20px 0;
                `}
              />
              <Row justify="between" align="start">
                <Col xs="content">
                  <Typography size={16} weight={900} color="primary">
                    My Liquidity
                  </Typography>
                </Col>
                <Col xs="content">
                  <div
                    css={css`
                      text-align: right;
                    `}
                  >
                    <Typography
                      size={22}
                      weight={900}
                      color="primary"
                      css={css`
                        margin-bottom: 2px;
                      `}
                    >
                      $
                      {dashboardPoolData?.recent.tvl &&
                        formatNumber(
                          formatDecimals(
                            Numeric.parse(userShare).mul(
                              dashboardPoolData?.recent.tvl,
                            ),
                            2,
                          ),
                        )}
                    </Typography>
                    <Typography size={14} weight={500} color="text.secondary">
                      =
                      {formatNumber(
                        formatDecimals(
                          amountToValue(lpBalance, LP_DECIMALS) || 0,
                          2,
                        ),
                      )}
                      &nbsp;LP
                    </Typography>
                  </div>
                </Col>
              </Row>
            </>
          )}
        </Panel>
        <Row
          justify="between"
          align="start"
          gutterWidth={14}
          css={css`
            row-gap: 13px;
            margin-bottom: 13px;
          `}
        >
          <Col xs={12} md={7}>
            {poolAddress && <Chart tokenAddress={poolAddress} />}
          </Col>
          <Col xs={12} md={5}>
            {poolAddress && <PoolSummary poolAddress={poolAddress} />}
          </Col>
        </Row>

        <Typography
          color="primary"
          size={32}
          weight={900}
          css={css`
            margin-bottom: 19px;
          `}
        >
          Transactions
        </Typography>
        <Hr
          css={css`
            margin-bottom: 20px;
          `}
        />
        {poolAddress && <PoolTransactions poolAddress={poolAddress} />}
      </Container>
    </Wrapper>
  );
}

export default PoolDetailPage;
