import { css } from "@emotion/react";
import AssetIcon from "components/AssetIcon";
import IconButton from "components/IconButton";
import Typography from "components/Typography";
import Expand from "pages/Earn/Expand";
import { Col, Row } from "react-grid-system";

import iconBookmark from "assets/icons/icon-bookmark-default.svg";
import iconBookmarkSelected from "assets/icons/icon-bookmark-selected.svg";
import styled from "@emotion/styled";
import Button from "components/Button";
import { Link } from "react-router-dom";
import HoverUnderline from "components/utils/HoverUnderline";
import CurrencyFormatter from "components/utils/CurrencyFormatter";
import AssetValueFormatter from "components/utils/AssetValueFormatter";
import { TokenWithBalanceAndValue } from "./Assets";

interface MobileAssetItemProps {
  asset: Partial<TokenWithBalanceAndValue>;
  isBookmarked?: boolean;
  onBookmarkClick?(asset: Partial<TokenWithBalanceAndValue>): void;
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
                  <Link to={`/tokens/${asset.token}`}>
                    <HoverUnderline>{asset.name}</HoverUnderline>
                  </Link>
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
            <Value>
              <CurrencyFormatter value={asset.value} />
            </Value>
          </div>
        </Content>
      }
      hasDivider={false}
    >
      <Content>
        <div>
          <Label>Total Amount</Label>
          <Value>
            <AssetValueFormatter asset={asset} amount={asset.balance} />
          </Value>
        </div>
        {asset.token && (
          <div>
            <Link
              to={{
                pathname: "/trade/swap",
                search: new URLSearchParams({
                  q: asset.token,
                }).toString(),
              }}
            >
              <Button block variant="primary">
                Swap
              </Button>
            </Link>
          </div>
        )}
      </Content>
    </Expand>
  );
}

export default MobileAssetItem;
