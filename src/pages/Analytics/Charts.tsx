import { css } from "@emotion/react";
import styled from "@emotion/styled";
import LineChart, { LineChartProps } from "components/LineChart";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import Select from "pages/Earn/Pools/Select";
import { Row, Col, useScreenClass } from "react-grid-system";
import {
  formatBigNumber,
  formatDate,
  formatCurrency,
  getSumOfDashboardChartData,
  formatDateRange,
} from "utils";
import useDashboard from "hooks/dashboard/useDashboard";
import {
  DashboardChartDuration,
  DashboardChartItem,
} from "types/dashboard-api";
import IconButton from "components/IconButton";
import iconFullscreen from "assets/icons/icon-fullscreen.svg";
import useHashModal from "hooks/useHashModal";
import { useId, useMemo } from "react";
import Modal from "components/Modal";
import CurrencyFormatter from "components/utils/CurrencyFormatter";
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
  const chartModal = useHashModal(useId());
  const screenClass = useScreenClass();
  const isSmallScreen =
    screenClass === MOBILE_SCREEN_CLASS || screenClass === TABLET_SCREEN_CLASS;

  const label = useMemo(() => {
    return <Label>{title}</Label>;
  }, [title]);

  const select = useMemo(() => {
    return (
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
    );
  }, [duration, onDurationChange, screenClass]);

  const content = useMemo(() => {
    return (
      <Row
        justify="start"
        align="end"
        gutterWidth={10}
        wrap="wrap"
        css={css`
          margin-bottom: ${size === "large" ? "6px" : "2px"};
        `}
        style={!isSmallScreen ? { maxHeight: 44 } : undefined}
      >
        <Col xs="content">
          <Value>{defaultValue}</Value>
        </Col>
        <Col xs="content">
          <Caption>{defaultCaption}</Caption>
        </Col>
      </Row>
    );
  }, [defaultCaption, defaultValue, isSmallScreen, size]);

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
        <Col xs="content">{label}</Col>
        {size === "large" && (
          <Col xs="content">
            <Row justify="end" align="center" gutterWidth={14}>
              <Col xs="content">{select}</Col>
              {isSmallScreen && (
                <Col>
                  <IconButton
                    icons={{ default: iconFullscreen }}
                    size={24}
                    onClick={() => chartModal.open()}
                  />
                </Col>
              )}
            </Row>
          </Col>
        )}
      </Row>
      {content}
      {!(isSmallScreen && size === "small") && (
        <LineChart height={size === "large" ? 200 : 102} {...lineChartProps} />
      )}

      <Modal
        isOpen={chartModal.isOpen}
        drawer
        hasCloseButton
        onRequestClose={() => chartModal.close()}
        style={{ header: { marginBottom: 4 } }}
        title={
          <Row
            justify="between"
            align="center"
            css={css`
              padding-right: 38px;
            `}
          >
            <Col xs="content">{label}</Col>
            <Col xs="content">{select}</Col>
          </Row>
        }
      >
        {content}
        <LineChart height="62vh" {...lineChartProps} />
      </Modal>
    </Panel>
  );
}

function Charts() {
  const volume = useChartData("volume");
  const tvl = useChartData("tvl");
  // const fee = useChartData("fee");

  const { statistics } = useDashboard();

  // TODO: Refactor
  const addresses: DashboardChartItem[] =
    statistics?.map((item) => ({
      t: item.timestamp,
      v: `${item.addressCount || 0}`,
    })) || [];

  const transactions: DashboardChartItem[] =
    statistics?.map((item) => ({
      t: item.timestamp,
      v: `${item.txCount || 0}`,
    })) || [];

  const fees: DashboardChartItem[] =
    statistics?.map((item) => ({
      t: item.timestamp,
      v: `${item.fee || 0}`,
    })) || [];

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
            defaultValue={
              volume?.data &&
              `${formatCurrency(getSumOfDashboardChartData(volume.data))}`
            }
            defaultCaption={
              volume?.data?.[0]
                ? formatDateRange(
                    volume.data[0].t,
                    volume.data[volume.data.length - 1]?.t,
                  )
                : ""
            }
            data={volume.data?.map((item) => item.v) || []}
            duration={volume.duration}
            onDurationChange={(duration) => volume.setDuration(duration)}
            renderTooltip={({ value, index }) => {
              const [prevDate, currentDate] = [
                volume.data?.[index - 1]?.t,
                volume.data?.[index]?.t,
              ];

              if (!currentDate) {
                return null;
              }

              const formattedDate =
                volume.duration === "month"
                  ? formatDate(currentDate)
                  : formatDateRange(prevDate, currentDate);

              return (
                <div
                  css={css`
                    white-space: nowrap;
                  `}
                >
                  <Typography size={20} weight={900} color="primary">
                    <CurrencyFormatter value={value} />
                  </Typography>
                  <Typography size={12} weight={400}>
                    {formattedDate}
                  </Typography>
                </div>
              );
            }}
          />

          <Chart
            size="large"
            title="TVL"
            defaultValue={`${formatCurrency(
              tvl.data?.[tvl.data.length - 1]?.v.toString() || "0",
            )}`}
            defaultCaption={
              tvl?.data?.[0] ? formatDate(tvl.data[tvl.data.length - 1]?.t) : ""
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
                  <CurrencyFormatter value={value} />
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
              getSumOfDashboardChartData(addresses),
            )}
            defaultCaption={
              addresses?.[0]
                ? formatDateRange(
                    addresses[0].t,
                    addresses[addresses.length - 1]?.t,
                  )
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
              getSumOfDashboardChartData(transactions),
            )}
            defaultCaption={
              transactions?.[0]
                ? formatDateRange(
                    transactions[0].t,
                    transactions[transactions.length - 1]?.t,
                  )
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
            defaultValue={`${formatCurrency(getSumOfDashboardChartData(fees))}`}
            defaultCaption={
              fees?.[0]
                ? formatDateRange(fees[0].t, fees[fees.length - 1]?.t)
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
                  <CurrencyFormatter value={value} />
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
