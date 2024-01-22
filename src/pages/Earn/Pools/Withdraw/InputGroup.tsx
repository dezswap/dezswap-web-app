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
import { LP_DECIMALS } from "constants/dezswap";
import useBalance from "hooks/useBalance";
import { DISPLAY_DECIMAL } from "constants/layout";
import { Token } from "types/api";
import { UseControllerProps, useController } from "react-hook-form";
import useDashboardPoolDetail from "hooks/dashboard/useDashboardPoolDetail";
import usePairs from "hooks/usePairs";
import usePool from "hooks/usePool";
import { useMemo } from "react";
import { Numeric } from "@xpla/xpla.js";

interface InputGroupProps extends NumberInputProps {
  lpToken?: string;
  assets?: (Partial<Token> | undefined)[];
  onBalanceClick?(
    value: string,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controllerProps: UseControllerProps<any>;
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
function InputGroup({
  lpToken,
  assets,
  onBalanceClick,
  style,
  controllerProps,
  ...inputProps
}: InputGroupProps) {
  const screenClass = useScreenClass();
  const balance = useBalance(lpToken || "");
  const theme = useTheme();
  const { field } = useController(controllerProps);
  const { findPairByLpAddress } = usePairs();
  const poolAddress = findPairByLpAddress(lpToken || "")?.contract_addr || "";
  const pool = usePool(poolAddress);
  const dashboardPool = useDashboardPoolDetail(poolAddress);

  const valueUsd = useMemo(() => {
    if (!dashboardPool?.recent.tvl || !field.value) {
      return 0;
    }
    try {
      const res = Numeric.parse(field.value)
        .dividedBy(amountToValue(pool?.total_share || 0, LP_DECIMALS) || 1)
        .mul(dashboardPool?.recent.tvl)
        .toNumber();
      return res;
    } catch (error) {
      return 0;
    }
  }, [dashboardPool?.recent.tvl, field.value, pool?.total_share]);

  return (
    <Box style={style}>
      <Row justify="between" align="center" style={{ gap: 3, marginBottom: 5 }}>
        <Col xs={12} sm="content">
          <Row gutterWidth={4} justify="start" align="center" wrap="nowrap">
            <Col xs="content" style={screenClass === "xs" ? { flex: 1 } : {}}>
              <AssetButton block={screenClass === "xs"}>
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
            {valueUsd ? `= $${formatNumber(formatDecimals(valueUsd, 2))}` : "-"}
          </Typography>
        </Col>
      </Row>
    </Box>
  );
}

export default InputGroup;
