import { forwardRef } from "react";
import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import Box from "components/Box";
import Button from "components/Button";
import Copy from "components/Copy";
import { NumberInput, NumberInputProps } from "components/Input";
import Typography from "components/Typography";
import { Col, Row, useScreenClass } from "react-grid-system";
import { formatNumber, formatDecimals, amountToValue } from "utils";
import iconDefaultToken from "assets/icons/icon-default-token.svg";
import { Token } from "types/api";
import useBalance from "hooks/useBalance";

interface InputGroupProps extends NumberInputProps {
  asset?: Partial<Token>;
  onBalanceClick?(
    value: string,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void;
}

const AssetButton = styled(Button)<{ iconSrc?: string }>`
  pointer-events: none;
  border-radius: 30px;
  height: 38px;
  padding: 4px 9px;
  justify-content: flex-start;
  font-size: 16px;
  font-weight: 700;
  &::before {
    content: "";
    width: 24px;
    height: 24px;
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 50%;
    background-image: ${({ iconSrc }) => `url(${iconSrc || iconDefaultToken})`};
    background-size: cover;
    background-position: 50% 50%;
    border-radius: 50%;
    margin-right: 4px;
  }
`;
const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(
  ({ asset, onBalanceClick, style, ...inputProps }, ref) => {
    const screenClass = useScreenClass();
    const theme = useTheme();
    const balance = useBalance(asset?.token);

    return (
      <Box style={style}>
        <Row justify="between" align="center" style={{ gap: 3 }}>
          <Col xs={12} sm="content">
            <Row gutterWidth={4} justify="start" align="center" wrap="nowrap">
              <Col xs="content" style={screenClass === "xs" ? { flex: 1 } : {}}>
                <AssetButton block={screenClass === "xs"} iconSrc={asset?.icon}>
                  {asset?.symbol}
                </AssetButton>
              </Col>
              <Col xs="content" className="cm-hidden">
                <Copy size={38} value={asset?.token} />
              </Col>
            </Row>
          </Col>
          <Col xs={12} sm="content">
            <Typography
              css={css`
                opacity: 0.5;
                line-height: 38px;
                text-align: right;
                cursor: pointer;
              `}
              onClick={(event) => {
                if (onBalanceClick) {
                  onBalanceClick(
                    amountToValue(balance, asset?.decimals) || "",
                    event,
                  );
                }
              }}
            >
              Balance:&nbsp;
              <span
                css={css`
                  color: ${theme.colors.primary};
                  text-decoration: underline;
                  text-underline-offset: 3px;
                `}
              >
                {formatNumber(
                  formatDecimals(
                    amountToValue(balance, asset?.decimals) || 0,
                    3,
                  ),
                )}
              </span>
            </Typography>
          </Col>
        </Row>
        <Row>
          <Col xs={24}>
            <NumberInput
              ref={ref}
              variant="base"
              size="large"
              placeholder="0"
              align="right"
              {...inputProps}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={24}>
            <Typography
              size={14}
              css={css`
                opacity: 0.7;
                text-align: right;
              `}
            >
              -
            </Typography>
          </Col>
        </Row>
      </Box>
    );
  },
);

export default InputGroup;
