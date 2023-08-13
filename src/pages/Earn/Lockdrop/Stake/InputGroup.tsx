import { forwardRef } from "react";
import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import Box from "components/Box";
import Button from "components/Button";
import Copy from "components/Copy";
import { NumberInput } from "components/Input";
import Typography from "components/Typography";
import { Col, Row, useScreenClass } from "react-grid-system";
import { formatNumber, formatDecimals, amountToValue } from "utils";
import iconDefaultToken from "assets/icons/icon-default-token.svg";
import { LP_DECIMALS } from "constants/dezswap";
import useBalance from "hooks/useBalance";
import { DISPLAY_DECIMAL, MOBILE_SCREEN_CLASS } from "constants/layout";
import { Token } from "types/api";

interface InputGroupProps extends React.HTMLAttributes<HTMLInputElement> {
  lpToken?: string;
  assets?: (Partial<Token> | undefined)[];
  onBalanceClick?(
    value: string,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void;
}

const AssetButton = styled(Button)`
  pointer-events: none;
  border-radius: 30px;
  height: 38px;
  padding: 4px 9px;
  justify-content: flex-start;
  font-size: 16px;
  font-weight: 700;
`;
const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(
  ({ lpToken, assets, onBalanceClick, style, ...inputProps }, ref) => {
    const screenClass = useScreenClass();
    const balance = useBalance(lpToken || "");
    const theme = useTheme();

    return (
      <Box style={style}>
        <Row
          justify="between"
          align="center"
          gutterWidth={0}
          style={{ gap: 3 }}
          wrap={screenClass === MOBILE_SCREEN_CLASS ? "wrap" : "nowrap"}
        >
          <Col xs={12} sm="content">
            <Row gutterWidth={4} justify="start" align="center" wrap="nowrap">
              <Col
                xs="content"
                style={screenClass === MOBILE_SCREEN_CLASS ? { flex: 1 } : {}}
              >
                <AssetButton block={screenClass === MOBILE_SCREEN_CLASS}>
                  <img
                    src={assets?.[0]?.icon || iconDefaultToken}
                    width={24}
                    alt={assets?.[0]?.symbol}
                    css={css`
                      margin-right: 4px;
                      background-color: ${theme.colors.white};
                      border-radius: 50%;
                    `}
                  />
                  {assets?.[0]?.symbol}&nbsp;-&nbsp;
                  <img
                    src={assets?.[1]?.icon || iconDefaultToken}
                    width={24}
                    alt={assets?.[1]?.symbol}
                    css={css`
                      margin-right: 4px;
                      background-color: ${theme.colors.white};
                      border-radius: 50%;
                    `}
                  />
                  {assets?.[1]?.symbol}
                </AssetButton>
              </Col>
              <Col xs="content" className="cm-hidden">
                <Copy size={38} value={lpToken} />
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
                    amountToValue(balance, LP_DECIMALS) || "",
                    event,
                  );
                }
              }}
            >
              LP Balance:&nbsp;
              <span
                css={css`
                  color: ${theme.colors.primary};
                  text-decoration: underline;
                  text-underline-offset: 3px;
                `}
              >
                {formatNumber(
                  formatDecimals(
                    amountToValue(balance, LP_DECIMALS) || 0,
                    DISPLAY_DECIMAL,
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
