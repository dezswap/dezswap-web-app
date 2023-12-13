import { css } from "@emotion/react";
import LineChart from "components/LineChart";
import Panel from "components/Panel";
import TabButton from "components/TabButton";
import Typography from "components/Typography";
import { useState } from "react";
import { Row, Col, useScreenClass } from "react-grid-system";
import {
  DashboardTokenChartType,
  DashboardChartDuration,
} from "types/dashboard-api";
import { formatCurrency, formatDate } from "utils";
import Select from "pages/Earn/Pools/Select";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import useChartData from "./useChartData";

const chartTypeTabs = ["Volume", "TVL", "Price"].map((label) => ({
  key: label,
  label,
  value: label.toLowerCase() as DashboardTokenChartType,
}));

const chartDurationOptions = ["Month", "Quarter", "Year", "All"].map(
  (value) => ({
    key: value,
    label: value,
    value: value.toLowerCase() as DashboardChartDuration,
  }),
);

function Chart({ tokenAddress }: { tokenAddress: string }) {
  const screenClass = useScreenClass();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const {
    data: chartData,
    duration,
    setDuration,
  } = useChartData(tokenAddress, chartTypeTabs[selectedTabIndex].value);

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
                max-width: 234px;
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
            {`${formatCurrency(
              chartData?.[chartData.length - 1]?.v.toString() || "0",
            )}`}
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
              {formatCurrency(value)}
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
