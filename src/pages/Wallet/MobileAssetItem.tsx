import { css } from "@emotion/react";
import AssetIcon from "components/AssetIcon";
import IconButton from "components/IconButton";
import Typography from "components/Typography";
import Expand from "pages/Earn/Expand";
import { Col, Row } from "react-grid-system";

import iconBookmark from "assets/icons/icon-bookmark-default.svg";
import iconBookmarkSelected from "assets/icons/icon-bookmark-selected.svg";
import styled from "@emotion/styled";
import { amountToValue, formatDecimals, formatNumber } from "utils";
import Button from "components/Button";
import { TokenWithBalance } from "./Assets";

interface MobileAssetItemProps {
  asset: Partial<TokenWithBalance>;
  isBookmarked?: boolean;
  onBookmarkClick?(asset: Partial<TokenWithBalance>): void;
}

const Content = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  flex: 1;
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

function MobileAssetItem({
  asset,
  isBookmarked,
  onBookmarkClick,
}: MobileAssetItemProps) {
  return (
    <Expand
      header={
        <Content
          css={css`
            padding: 20px;
          `}
        >
          <div>
            <Label>Token</Label>
            <Row
              justify="between"
              align="center"
              gutterWidth={10}
              wrap="nowrap"
            >
              <Col
                xs="content"
                css={css`
                  font-size: 0;
                `}
              >
                <AssetIcon asset={asset} />
              </Col>
              <Col
                css={css`
                  min-width: 0;
                `}
              >
                <Value
                  css={css`
                    max-width: 100%;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                  `}
                >
                  {asset.name}
                </Value>
              </Col>
              <Col xs="content">
                <IconButton
                  size={32}
                  icons={{
                    default: isBookmarked ? iconBookmarkSelected : iconBookmark,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (onBookmarkClick) {
                      onBookmarkClick(asset);
                    }
                  }}
                />
              </Col>
            </Row>
          </div>
          <div>
            <Label>Value</Label>
            <Value>TBD</Value>
          </div>
        </Content>
      }
    >
      <Content>
        <div>
          <Label>Total Amount</Label>
          <Value>
            {formatNumber(
              formatDecimals(amountToValue(asset.balance) || "0", 2),
            )}
            &nbsp;{asset.symbol}
          </Value>
        </div>
        <div>
          <Button block variant="primary">
            Swap
          </Button>
        </div>
      </Content>
    </Expand>
  );
}

export default MobileAssetItem;
