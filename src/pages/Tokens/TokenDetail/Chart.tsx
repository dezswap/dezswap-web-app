import { css } from "@emotion/react";
import LineChart, { LineChartProps } from "components/LineChart";
import Panel from "components/Panel";
import TabButton from "components/TabButton";
import Typography from "components/Typography";
import { useId, useMemo, useState } from "react";
import { Row, Col, useScreenClass } from "react-grid-system";
import {
  DashboardTokenChartType,
  DashboardChartDuration,
} from "types/dashboard-api";
import { formatCurrency, formatDate } from "utils";
import Select from "pages/Earn/Pools/Select";
import { MOBILE_SCREEN_CLASS } from "constants/layout";
import IconButton from "components/IconButton";
import iconFullscreen from "assets/icons/icon-fullscreen.svg";
import useHashModal from "hooks/useHashModal";
import Modal from "components/Modal";
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

  const chartModal = useHashModal(useId());

  const header = useMemo(() => {
    return (
      <Row justify="between" align="center">
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
    );
  }, [duration, screenClass, selectedTabIndex, setDuration]);

  const content = useMemo(() => {
    return (
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
              ? formatDate(chartData[chartData.length - 1].t)
              : ""}
          </Typography>
        </Col>
      </Row>
    );
  }, [chartData]);

  const lineChartProps = useMemo<Omit<LineChartProps, "height">>(() => {
    return {
      data: chartData?.map((item) => item.v) || [],
      renderTooltip({ value, index }) {
        return (
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
        );
      },
    };
  }, [chartData]);

  return (
    <Panel shadow>
      <div
        css={css`
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
        `}
      >
        <div
          css={css`
            flex: 1;
          `}
        >
          {header}
        </div>
        {screenClass === MOBILE_SCREEN_CLASS && (
          <div>
            <IconButton
              icons={{ default: iconFullscreen }}
              size={24}
              onClick={() => chartModal.open()}
            />
          </div>
        )}
      </div>
      {content}

      <LineChart key={selectedTabIndex} height={291} {...lineChartProps} />

      <Modal
        isOpen={chartModal.isOpen}
        drawer
        hasCloseButton
        onRequestClose={() => chartModal.close()}
        title={
          <div
            css={css`
              padding-right: 38px;
            `}
          >
            {header}
          </div>
        }
        style={{ header: { marginBottom: 4 } }}
      >
        {content}
        <LineChart height="62vh" {...lineChartProps} />
      </Modal>
    </Panel>
  );
}

export default Chart;
