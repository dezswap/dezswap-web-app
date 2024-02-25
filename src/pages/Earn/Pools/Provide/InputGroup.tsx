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
import { Numeric } from "@xpla/xpla.js";
import { UseControllerProps, useController } from "react-hook-form";
import useDashboardTokenDetail from "hooks/dashboard/useDashboardTokenDetail";
import { useMemo } from "react";
import AssetValueFormatter from "components/utils/AssetValueFormatter";

interface InputGroupProps extends NumberInputProps {
  asset?: Partial<Token> | null;
  onBalanceClick?(
    value: string,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controllerProps: UseControllerProps<any>;
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
function InputGroup({
  asset,
  onBalanceClick,
  style,
  controllerProps,
  ...inputProps
}: InputGroupProps) {
  const { field } = useController(controllerProps);
  const screenClass = useScreenClass();
  const theme = useTheme();
  const balance = useBalance(asset?.token);
  const dashboardToken = useDashboardTokenDetail(asset?.token || "");

  const expectedUsdValue = useMemo(() => {
    try {
      if (dashboardToken?.price && field.value) {
        return `= $${formatNumber(
          formatDecimals(
            Numeric.parse(dashboardToken?.price || 0).mul(field.value),
            2,
          ),
        )}`;
      }
    } catch (error) {
      console.log(error);
    }
    return "-";
  }, [dashboardToken, field.value]);

  return (
    <Box style={style}>
      <Row justify="between" align="center" style={{ gap: 3, marginBottom: 5 }}>
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
              {asset && (
                <AssetValueFormatter
                  asset={asset}
                  amount={balance}
                  showSymbol={false}
                />
              )}
            </span>
          </Typography>
        </Col>
      </Row>
      <Row>
        <Col xs={24}>
          <NumberInput
            variant="base"
            size="large"
            placeholder="0"
            align="right"
            style={{
              textOverflow: "ellipsis",
            }}
            {...inputProps}
            {...field}
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
            {expectedUsdValue}
          </Typography>
        </Col>
      </Row>
    </Box>
  );
}
export default InputGroup;
