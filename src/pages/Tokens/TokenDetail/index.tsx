import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Numeric } from "@xpla/xpla.js";
import Breadcrumb from "components/Breadcrumb";
import Hr from "components/Hr";
import IconButton from "components/IconButton";
import Panel from "components/Panel";
import useInvalidPathModal from "hooks/modals/useInvalidPathModal";
import useAssets from "hooks/useAssets";
import useBookmark from "hooks/useBookmark";
import { useEffect, useMemo } from "react";
import {
  Col,
  Container,
  Hidden,
  Row,
  Visible,
  useScreenClass,
} from "react-grid-system";
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
  getTokenLink,
} from "utils";
import useNetwork from "hooks/useNetwork";
import Button from "components/Button";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import useBalance from "hooks/useBalance";
import ScrollToTop from "components/ScrollToTop";
import useDashboardTokenDetail from "hooks/dashboard/useDashboardTokenDetail";
import AssetValueFormatter from "components/utils/AssetValueFormatter";
import Chart from "./Chart";
import TokenSummary from "./TokenSummary";
import TokenTransactions from "./TokenTransactions";
import TokenPools from "./TokenPools";

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
`;

function TokenDetailPage() {
  const screenClass = useScreenClass();
  const network = useNetwork();
  const navigate = useNavigate();
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const { bookmarks, toggleBookmark } = useBookmark();
  const invalidPathModal = useInvalidPathModal({
    onReturnClick() {
      navigate("..", { replace: true, relative: "route" });
    },
  });

  const dashboardToken = useDashboardTokenDetail(tokenAddress || "");

  const { getAsset } = useAssets();

  const asset = useMemo(() => {
    return tokenAddress ? getAsset(tokenAddress) : undefined;
  }, [tokenAddress, getAsset]);

  const isBookmarked = useMemo(() => {
    return tokenAddress ? bookmarks?.includes(tokenAddress) : false;
  }, [bookmarks, tokenAddress]);

  const balance = useBalance(tokenAddress || "");

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
          if (tokenAddress) {
            toggleBookmark(tokenAddress);
          }
        }}
      />
    ),
    [isBookmarked, tokenAddress, toggleBookmark],
  );

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (dashboardToken === null) {
        invalidPathModal.open();
      }
    }, 500);
    return () => {
      clearTimeout(timerId);
    };
  }, [dashboardToken, invalidPathModal, network]);

  const actionButtons = useMemo(
    () => (
      <Row justify="between" align="center" gutterWidth={10}>
        <Col xs={6}>
          {asset?.token && (
            <Link
              to={{
                pathname: "/earn/pools",
                search: new URLSearchParams({
                  q: asset.token,
                }).toString(),
              }}
            >
              <Button variant="primary" block>
                Add liquidity
              </Button>
            </Link>
          )}
        </Col>
        <Col xs={6}>
          {tokenAddress && (
            <Link
              to={{
                pathname: "/trade/swap",
                search: new URLSearchParams({
                  q: tokenAddress,
                }).toString(),
              }}
            >
              <Button variant="primary" block>
                Swap
              </Button>
            </Link>
          )}
        </Col>
      </Row>
    ),
    [asset, tokenAddress],
  );

  return (
    <Wrapper key={tokenAddress}>
      <ScrollToTop />
      <Container>
        <div
          css={css`
            margin-bottom: 19px;
          `}
        >
          <Breadcrumb
            items={[
              { label: "Analytics", to: "/" },
              {
                label: asset?.name || "",
                to: `/tokens/${tokenAddress}`,
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
              row-gap: 20px;
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
                    <Hidden xs>
                      <Col xs="content">{bookmarkButton}</Col>
                    </Hidden>
                    <Col xs="content">
                      <AssetIcon asset={{ icon: asset?.icon }} />
                    </Col>
                    <Col xs="content">
                      <Typography
                        size={screenClass === MOBILE_SCREEN_CLASS ? 16 : 26}
                        weight={900}
                        color="primary"
                      >
                        {asset?.name}
                      </Typography>
                    </Col>
                    <Col xs="content">
                      <Outlink
                        iconSize={19}
                        href={getTokenLink(tokenAddress, network.name)}
                      />
                    </Col>
                  </Row>
                </Col>
                <Visible xs>
                  <Col xs="content">{bookmarkButton}</Col>
                </Visible>
              </Row>
            </Col>
            <Hidden xs>
              <Col xs={12} sm={6}>
                <div
                  css={css`
                    max-width: 310px;
                    margin-left: auto;
                  `}
                >
                  {actionButtons}
                </div>
              </Col>
            </Hidden>
            {Numeric.parse(balance).gt(0) && (
              <Col xs={12}>
                <Hr
                  css={css`
                    margin-bottom: 20px;
                  `}
                />
                <Row
                  justify="between"
                  align="start"
                  css={css`
                    row-gap: 10px;
                  `}
                >
                  <Col xs={12} sm="content">
                    <Typography
                      size={screenClass === MOBILE_SCREEN_CLASS ? 14 : 16}
                      weight={900}
                      color="primary"
                    >
                      My Balance
                    </Typography>
                  </Col>
                  <Col xs={12} sm="content">
                    <div
                      css={css`
                        text-align: right;
                        .${MOBILE_SCREEN_CLASS} & {
                          text-align: left;
                        }
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
                        {formatNumber(
                          formatDecimals(
                            Numeric.parse(dashboardToken?.price || 0).mul(
                              amountToValue(balance, asset?.decimals) || 0,
                            ),
                            2,
                          ),
                        )}
                      </Typography>
                      <Typography size={14} weight={500} color="text.secondary">
                        =&nbsp;
                        <AssetValueFormatter asset={asset} amount={balance} />
                      </Typography>
                    </div>
                  </Col>
                </Row>
              </Col>
            )}
            <Visible xs>
              <Col xs={12}>{actionButtons}</Col>
            </Visible>
          </Row>
        </Panel>
        <Row
          justify="between"
          align="start"
          gutterWidth={14}
          css={css`
            row-gap: 13px;
            margin-bottom: 50px;
          `}
        >
          <Col xs={12} md={7}>
            {tokenAddress && <Chart tokenAddress={tokenAddress} />}
          </Col>
          <Col xs={12} md={5}>
            {tokenAddress && <TokenSummary tokenAddress={tokenAddress} />}
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
          Pools
        </Typography>
        <Hr
          css={css`
            margin-bottom: 20px;
          `}
        />
        <div
          css={css`
            margin-bottom: 50px;
          `}
        >
          {tokenAddress && <TokenPools tokenAddress={tokenAddress} />}
        </div>

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
        {tokenAddress && <TokenTransactions tokenAddress={tokenAddress} />}
      </Container>
    </Wrapper>
  );
}

export default TokenDetailPage;
