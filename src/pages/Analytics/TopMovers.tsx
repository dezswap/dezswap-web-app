import { css } from "@emotion/react";
import { Numeric } from "@xpla/xpla.js";
import AssetIcon from "components/AssetIcon";
import Box from "components/Box";
import ChangeRateFormatter from "components/utils/ChangeRateFormatter";
import Marquee from "components/Marquee";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import useAssets from "hooks/useAssets";
import useDashboard from "hooks/dashboard/useDashboard";
import { useMemo } from "react";
import { Col, Row, useScreenClass } from "react-grid-system";
import { Link } from "react-router-dom";
import CurrencyFormatter from "components/utils/CurrencyFormatter";

function TopMovers() {
  const screenClass = useScreenClass();
  const { getAsset } = useAssets();
  const { tokens } = useDashboard();
  const topMovingTokens = useMemo(
    () =>
      tokens
        ?.toSorted((a, b) => {
          return Numeric.parse(b.volume24h).minus(a.volume24h).toNumber();
        })
        .slice(0, 10),
    [tokens],
  );

  return (
    <Panel shadow noPadding>
      <Panel
        border={false}
        css={css`
          padding-bottom: 0;
        `}
      >
        <Typography
          size={screenClass === MOBILE_SCREEN_CLASS ? 14 : 20}
          weight={900}
          color="primary"
          css={css`
            margin-bottom: 10px;
          `}
        >
          Top Movers
        </Typography>
      </Panel>
      <Marquee duration="60s">
        <div
          css={css`
            display: flex;
            position: relative;
          `}
        >
          {topMovingTokens?.map((token) => {
            const asset = getAsset(token.address);
            if (!asset) {
              return null;
            }
            return (
              <Link
                key={token.address}
                to={`/tokens/${encodeURIComponent(token.address)}`}
                css={css`
                  margin: 0 10px;
                `}
              >
                <Box
                  css={css`
                    width: 255px;
                  `}
                >
                  <Row justify="start" align="center" gutterWidth={10}>
                    <Col
                      xs="content"
                      css={css`
                        line-height: 1;
                        font-size: 0;
                      `}
                    >
                      <AssetIcon asset={{ icon: asset?.icon }} />
                    </Col>
                    <Col
                      css={css`
                        min-width: 0;
                      `}
                    >
                      <div
                        css={css`
                          display: flex;
                          justify-content: flex-start;
                          align-items: center;
                        `}
                      >
                        <Typography
                          size={14}
                          weight={700}
                          color="primary"
                          css={css`
                            white-space: nowrap;
                            word-break: break-all;
                            text-overflow: ellipsis;
                            overflow: hidden;
                          `}
                        >
                          {asset?.name}&nbsp;
                        </Typography>
                        {asset?.symbol && (
                          <Typography
                            size={14}
                            weight={700}
                            color="text.primary"
                            css={css`
                              opacity: 0.7;
                              display: inline-block;
                            `}
                          >
                            ({asset.symbol})
                          </Typography>
                        )}
                      </div>
                      <Typography size={14} weight={700} color="primary">
                        <CurrencyFormatter value={token.price} />
                        &nbsp;
                        <ChangeRateFormatter
                          rate={token.priceChange}
                          hasBrackets={false}
                        />
                      </Typography>
                    </Col>
                  </Row>
                </Box>
              </Link>
            );
          })}
        </div>
      </Marquee>
      <Panel
        border={false}
        css={css`
          padding-top: 0;
        `}
      />
    </Panel>
  );
}

export default TopMovers;
