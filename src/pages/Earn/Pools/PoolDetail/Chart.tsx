import { css } from "@emotion/react";
import LineChart from "components/LineChart";
import Panel from "components/Panel";
import TabButton from "components/TabButton";
import Typography from "components/Typography";
import { useState } from "react";
import { Row, Col, useScreenClass } from "react-grid-system";
import {
  DashboardChartDuration,
  DashboardChartType,
} from "types/dashboard-api";
import { formatCurrency, formatDate } from "utils";
import Select from "pages/Earn/Pools/Select";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import { Numeric } from "@xpla/xpla.js";
import useChartData from "./useChartData";

const chartTypeTabs: {
  key: string;
  label: string;
  value: DashboardChartType;
}[] = [
  {
    key: "volume",
    label: "Volume",
    value: "volume",
  },
  {
    key: "tvl",
    label: "TVL",
    value: "tvl",
  },
  {
    key: "fee",
    label: "Fees",
    value: "fee",
  },
  {
    key: "apr",
    label: "APR",
    value: "apr",
  },
];

const chartDurationOptions = ["Month", "Quarter", "Year", "All"].map(
  (value) => ({
    key: value,
    label: value,
    value: value.toLowerCase() as DashboardChartDuration,
  }),
);

const chartValueFormatter = (
  value: Numeric.Input,
  chartType: DashboardChartType,
) => {
  return chartType === "apr"
    ? `${Numeric.parse(value).mul(100).toDecimalPlaces(2).toString()}%`
    : formatCurrency(value);
};

function Chart({ tokenAddress: poolAddress }: { tokenAddress: string }) {
  const screenClass = useScreenClass();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const selectedChartType = chartTypeTabs[selectedTabIndex]?.value;
  const {
    data: chartData,
    duration,
    setDuration,
  } = useChartData(poolAddress, selectedChartType);

  return (
    <Panel shadow>
      <Row
        justify="between"
        align="center"
        css={css`
          margin-bottom: 10px;
        `}
      >
        <Col xs="content" sm={6}>
          {screenClass !== MOBILE_SCREEN_CLASS && (
            <div
              css={css`
                max-width: 310px;
              `}
            >
              <TabButton
                items={chartTypeTabs}
                selectedIndex={selectedTabIndex}
                onChange={(index) => setSelectedTabIndex(index)}
              />
            </div>
          )}
          {screenClass === MOBILE_SCREEN_CLASS && (
            <Select
              options={chartTypeTabs}
              value={chartTypeTabs[selectedTabIndex].value}
              onChange={(value) => {
                setSelectedTabIndex(
                  chartTypeTabs.findIndex((item) => item.value === value),
                );
              }}
            />
          )}
        </Col>
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
              options={chartDurationOptions}
              value={duration}
              onChange={(value) => setDuration(value as DashboardChartDuration)}
            />
          </div>
        </Col>
      </Row>

      <Row
        justify="start"
        align="end"
        gutterWidth={10}
        css={css`
          margin-bottom: 6px;
        `}
      >
        <Col xs="content">
          <Typography size={32} weight={900} color="primary">
            {chartValueFormatter(
              chartData?.[chartData.length - 1]?.v.toString() || "0",
              selectedChartType,
            )}
          </Typography>
        </Col>
        <Col xs="content">
          <Typography
            size={12}
            weight={400}
            color="text.primary"
            css={css`
              margin-bottom: 7px;
            `}
          >
            {chartData?.[0]
              ? `${formatDate(chartData[0].t)} - ${formatDate(
                  chartData[chartData.length - 1].t,
                )}`
              : ""}
          </Typography>
        </Col>
      </Row>

      <LineChart
        height={291}
        data={chartData?.map((item) => item.v) || []}
        renderTooltip={({ value, index }) => (
          <div
            css={css`
              white-space: nowrap;
            `}
          >
            <Typography size={20} weight={900} color="primary">
              {chartValueFormatter(value, selectedChartType)}
            </Typography>
            <Typography size={12} weight={400}>
              {chartData?.[index] && formatDate(chartData?.[index].t)}
            </Typography>
          </div>
        )}
      />
    </Panel>
  );
}

export default Chart;
