import { css } from "@emotion/react";
import styled from "@emotion/styled";
import LineChart, { LineChartProps } from "components/LineChart";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import Select from "pages/Earn/Pools/Select";
import { Row, Col, useScreenClass } from "react-grid-system";
import { formatBigNumber, formatDate, formatCurrency } from "utils";
import useDashboard from "hooks/dashboard/useDashboard";
import { DashboardChartDuration } from "types/dashboard-api";
import useChartData from "./useChartData";

const Label = styled(Typography)``;
Label.defaultProps = {
  size: 16,
  weight: 900,
  color: "primary",
};

const Value = styled(Typography)``;
Value.defaultProps = {
  size: 32,
  weight: 900,
  color: "primary",
};

const Caption = styled(Typography)`
  padding-bottom: 7px;
`;
Caption.defaultProps = {
  size: 12,
  weight: 400,
  color: "text.primary",
};

const PanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

function Chart({
  title,
  defaultValue,
  defaultCaption,
  size,
  duration,
  onDurationChange,
  ...lineChartProps
}: Omit<LineChartProps, "height" | "onDurationChange"> & {
  title: string;
  defaultValue?: string;
  defaultCaption?: string;
  size?: "small" | "large";
  duration?: DashboardChartDuration;
  onDurationChange?(duration: DashboardChartDuration): void;
}) {
  const screenClass = useScreenClass();
  const isSmallScreen =
    screenClass === MOBILE_SCREEN_CLASS || screenClass === TABLET_SCREEN_CLASS;

  return (
    <Panel shadow>
      <Row
        justify="between"
        align="center"
        gutterWidth={10}
        css={css`
          margin-bottom: ${size === "large" ? "12.5px" : "2px"};
        `}
      >
        <Col xs="content">
          <Label>{title}</Label>
        </Col>
        {size === "large" && (
          <Col xs="content">
            <div
              css={
                screenClass !== MOBILE_SCREEN_CLASS &&
                css`
                  width: 117px;
                `
              }
            >
              <Select
                block
                options={["Month", "Quarter", "Year", "All"].map((value) => ({
                  key: value,
                  label: value,
                  value: value.toLowerCase(),
                }))}
                value={duration}
                onChange={(value) =>
                  onDurationChange &&
                  onDurationChange(value as DashboardChartDuration)
                }
              />
            </div>
          </Col>
        )}
      </Row>
      <Row
        justify="start"
        align="end"
        gutterWidth={10}
        wrap="nowrap"
        css={css`
          margin-bottom: ${size === "large" ? "6px" : "2px"};
        `}
      >
        <Col xs="content">
          <Value>{defaultValue}</Value>
        </Col>
        <Col xs="content">
          <Caption>{defaultCaption}</Caption>
        </Col>
      </Row>
      {!(isSmallScreen && size === "small") && (
        <LineChart height={size === "large" ? 200 : 102} {...lineChartProps} />
      )}
    </Panel>
  );
}

function Charts() {
  const volume = useChartData("volume");
  const tvl = useChartData("tvl");
  // const fee = useChartData("fee");

  const { statistics } = useDashboard();

  const addresses = statistics?.map((item) => ({
    t: item.timestamp,
    v: item.addressCount || 0,
  }));

  const transactions = statistics?.map((item) => ({
    t: item.timestamp,
    v: item.txCount || 0,
  }));

  const fees = statistics?.map((item) => ({
    t: item.timestamp,
    v: item.fee || 0,
  }));

  return (
    <Row
      justify="between"
      align="start"
      gutterWidth={14}
      css={css`
        row-gap: 14px;
      `}
    >
      <Col xs={12} md={8}>
        <PanelWrapper>
          <Chart
            size="large"
            title="Volume"
            defaultValue={`${formatCurrency(
              volume.data?.[volume.data.length - 1]?.v.toString() || "0",
            )}`}
            defaultCaption={
              volume?.data?.[0]
                ? `${formatDate(volume.data[0].t)} - ${formatDate(
                    volume.data[volume.data.length - 1]?.t,
                  )}`
                : ""
            }
            data={volume.data?.map((item) => item.v) || []}
            duration={volume.duration}
            onDurationChange={(duration) => volume.setDuration(duration)}
            renderTooltip={({ value, index }) => (
              <div
                css={css`
                  white-space: nowrap;
                `}
              >
                <Typography size={20} weight={900} color="primary">
                  {formatCurrency(value)}
                </Typography>
                <Typography size={12} weight={400}>
                  {volume.data?.[index] && formatDate(volume.data?.[index].t)}
                </Typography>
              </div>
            )}
          />

          <Chart
            size="large"
            title="TVL"
            defaultValue={`${formatCurrency(
              tvl.data?.[tvl.data.length - 1]?.v.toString() || "0",
            )}`}
            defaultCaption={
              tvl?.data?.[0]
                ? `${formatDate(tvl.data[0].t)} - ${formatDate(
                    tvl.data[tvl.data.length - 1]?.t,
                  )}`
                : ""
            }
            data={tvl.data?.map((item) => item.v) || []}
            duration={tvl.duration}
            onDurationChange={(duration) => tvl.setDuration(duration)}
            renderTooltip={({ value, index }) => (
              <div
                css={css`
                  white-space: nowrap;
                `}
              >
                <Typography size={20} weight={900} color="primary">
                  {formatCurrency(value)}
                </Typography>
                <Typography size={12} weight={400}>
                  {tvl.data?.[index] && formatDate(tvl.data?.[index].t)}
                </Typography>
              </div>
            )}
          />
        </PanelWrapper>
      </Col>
      <Col xs={12} md={4}>
        <PanelWrapper>
          <Chart
            size="small"
            title="Number of Addresses"
            defaultValue={formatBigNumber(
              addresses?.reduce((prev, curr) => prev + curr.v, 0).toString() ||
                0,
            )}
            defaultCaption={
              addresses?.[0]
                ? `${formatDate(addresses[0].t)} - ${formatDate(
                    addresses[addresses.length - 1]?.t,
                  )}`
                : ""
            }
            data={addresses?.map((item) => item.v) || []}
            renderTooltip={({ value, index }) => (
              <div
                css={css`
                  white-space: nowrap;
                `}
              >
                <Typography size={20} weight={900} color="primary">
                  {formatBigNumber(value)}
                </Typography>
                <Typography size={12} weight={400}>
                  {addresses?.[index] && formatDate(addresses?.[index].t)}
                </Typography>
              </div>
            )}
          />
          <Chart
            size="small"
            title="Number of Transactions"
            defaultValue={formatBigNumber(
              transactions
                ?.reduce((prev, curr) => prev + curr.v, 0)
                .toString() || 0,
            )}
            defaultCaption={
              transactions?.[0]
                ? `${formatDate(transactions[0].t)} - ${formatDate(
                    transactions[transactions.length - 1]?.t,
                  )}`
                : ""
            }
            data={transactions?.map((item) => item.v) || []}
            renderTooltip={({ value, index }) => (
              <div
                css={css`
                  white-space: nowrap;
                `}
              >
                <Typography size={20} weight={900} color="primary">
                  {formatBigNumber(value)}
                </Typography>
                <Typography size={12} weight={400}>
                  {transactions?.[index] && formatDate(transactions?.[index].t)}
                </Typography>
              </div>
            )}
          />
          <Chart
            size="small"
            title="Fees"
            defaultValue={`${formatCurrency(
              fees?.[fees.length - 1]?.v.toString() || "0",
            )}`}
            defaultCaption={
              fees?.[0]
                ? `${formatDate(fees[0].t)} - ${formatDate(
                    fees[fees.length - 1]?.t,
                  )}`
                : ""
            }
            data={fees?.map((item) => item.v) || []}
            renderTooltip={({ value, index }) => (
              <div
                css={css`
                  white-space: nowrap;
                `}
              >
                <Typography size={20} weight={900} color="primary">
                  {formatCurrency(value)}
                </Typography>
                <Typography size={12} weight={400}>
                  {fees?.[index] && formatDate(fees?.[index].t)}
                </Typography>
              </div>
            )}
          />
        </PanelWrapper>
      </Col>
    </Row>
  );
}

export default Charts;
