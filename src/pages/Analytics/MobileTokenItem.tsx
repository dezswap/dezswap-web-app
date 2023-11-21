import { css } from "@emotion/react";
import AssetIcon from "components/AssetIcon";
import Typography from "components/Typography";
import Expand from "pages/Earn/Expand";
import { Col, Row } from "react-grid-system";

import styled from "@emotion/styled";
import { Token } from "types/api";

interface MobileTokenItemProps {
  number: number;
  asset: Partial<Token>;
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

function MobileTokenItem({ number, asset }: MobileTokenItemProps) {
  return (
    <Expand
      hasDivider={false}
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
              <Col xs="content">
                <Typography color="primary">{number}</Typography>
              </Col>
              <Col
                xs="content"
                css={css`
                  font-size: 0;
                `}
              >
                <AssetIcon asset={{ icon: asset.icon }} />
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
            </Row>
          </div>
          <div>
            <Label>Price</Label>
            <Value>TBD</Value>
          </div>
        </Content>
      }
    >
      <Content>
        <div>
          <Label>Price change</Label>
          <Value>TBD</Value>
        </div>
        <div>
          <Label>Volume 24H</Label>
          <Value>TBD</Value>
        </div>
        <div>
          <Label>TVL</Label>
          <Value>TBD</Value>
        </div>
      </Content>
    </Expand>
  );
}

export default MobileTokenItem;
