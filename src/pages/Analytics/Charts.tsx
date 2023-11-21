import { css } from "@emotion/react";
import styled from "@emotion/styled";
import LineChart, { LineChartProps } from "components/LineChart";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import Select from "pages/Earn/Pools/Select";
import { Row, Col, useScreenClass } from "react-grid-system";

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
  ...lineChartProps
}: Omit<LineChartProps, "height"> & {
  title: string;
  defaultValue: string;
  defaultCaption: string;
  size?: "small" | "large";
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
              css={css`
                width: 117px;
              `}
            >
              <Select
                block
                options={["Month", "Quarter", "Year", "All"].map((value) => ({
                  key: value,
                  label: value,
                  value,
                }))}
                value="All"
              />
            </div>
          </Col>
        )}
      </Row>
      <Row
        justify="start"
        align="end"
        gutterWidth={10}
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
            defaultValue="$0"
            defaultCaption="Jun 23, 2023 - Jun 23, 2023"
            data={[30, 32, 23, 40, 67, 5, 15, 55]}
            renderTooltip={({ value, index }) => (
              <div
                css={css`
                  white-space: nowrap;
                `}
              >
                <Typography size={20} weight={900} color="primary">
                  ${value}
                </Typography>
                <Typography size={12} weight={400}>
                  Jun 23, 2023
                </Typography>
              </div>
            )}
          />

          <Chart
            size="large"
            title="TVL"
            defaultValue="$0"
            defaultCaption="Jun 23, 2023 - Jun 23, 2023"
            data={[32, 43, 68, 1, 66, 13, 50, 9, 19, 85]}
            renderTooltip={({ value, index }) => (
              <div
                css={css`
                  white-space: nowrap;
                `}
              >
                <Typography size={20} weight={900} color="primary">
                  ${value}
                </Typography>
                <Typography size={12} weight={400}>
                  Jun 23, 2023
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
            defaultValue="0"
            defaultCaption="Jun 23, 2023"
            data={[1, 2, 5, 7, 10, 24, 60, 80, 245, 252]}
            renderTooltip={({ value, index }) => (
              <div
                css={css`
                  white-space: nowrap;
                `}
              >
                <Typography size={20} weight={900} color="primary">
                  {value}
                </Typography>
                <Typography size={12} weight={400}>
                  Jun 23, 2023
                </Typography>
              </div>
            )}
          />
          <Chart
            size="small"
            title="Number of Transactions"
            defaultValue="0"
            defaultCaption="Jun 23, 2023"
            data={[1, 2, 5, 7, 10, 24, 60, 80, 245, 252]}
            renderTooltip={({ value, index }) => (
              <div
                css={css`
                  white-space: nowrap;
                `}
              >
                <Typography size={20} weight={900} color="primary">
                  {value}
                </Typography>
                <Typography size={12} weight={400}>
                  Jun 23, 2023
                </Typography>
              </div>
            )}
          />
          <Chart
            size="small"
            title="Fees"
            defaultValue="0"
            defaultCaption="Jun 23, 2023"
            data={[1, 2, 5, 7, 10, 24, 60, 80, 245, 252]}
            renderTooltip={({ value, index }) => (
              <div
                css={css`
                  white-space: nowrap;
                `}
              >
                <Typography size={20} weight={900} color="primary">
                  {value}
                </Typography>
                <Typography size={12} weight={400}>
                  Jun 23, 2023
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
