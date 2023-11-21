import { css, useTheme } from "@emotion/react";
import AssetIcon from "components/AssetIcon";
import Box from "components/Box";
import Marquee from "components/Marquee";
import Panel from "components/Panel";
import Typography from "components/Typography";
import useAssets from "hooks/useAssets";
import usePairs from "hooks/usePairs";
import { useMemo } from "react";
import { Col, Row } from "react-grid-system";
import { Link } from "react-router-dom";

function TopMovers() {
  const theme = useTheme();
  const { availableAssetAddresses } = usePairs();
  const { getAsset } = useAssets();
  const assets = useMemo(() => {
    return availableAssetAddresses
      .slice(0, 10)
      .map((address) => getAsset(address))
      .filter((asset) => asset?.token);
  }, [availableAssetAddresses, getAsset]);

  return (
    <Panel shadow>
      <Typography
        size={20}
        weight={900}
        color="primary"
        css={css`
          margin-bottom: 10px;
        `}
      >
        Top Movers
      </Typography>
      <Marquee duration="60s">
        <div
          css={css`
            display: flex;
            position: relative;
          `}
        >
          {assets.map((asset) => (
            <Link
              key={asset?.token}
              to="/"
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
                  <Col xs="content">
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
                      $TBD&nbsp;
                      <span
                        css={css`
                          color: ${theme.colors.positive};
                        `}
                      >
                        ↑0.01%
                      </span>
                    </Typography>
                  </Col>
                </Row>
              </Box>
            </Link>
          ))}
        </div>
      </Marquee>
    </Panel>
  );
}

export default TopMovers;
