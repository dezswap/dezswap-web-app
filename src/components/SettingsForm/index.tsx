import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import IconButton from "components/IconButton";
import Input, { NumberInput } from "components/Input";
import RadioButton from "components/RadioButton";
import Tooltip from "components/Tooltip";
import Typography from "components/Typography";
import { Col, Row } from "react-grid-system";
import { slippagePresets } from "stores/settings";

import iconQuestion from "assets/icons/icon-question.svg";
import useSlippageTolerance from "hooks/useSlippageTolerance";
import Switch from "components/Switch";
import useTxDeadlineMinutes from "hooks/useTxDeadlineMinutes";
import React, { useCallback } from "react";

type SettingItemKey = "slippageTolerance" | "txDeadline" | "autoRouter";
export interface SettingsFormProps {
  items?: SettingItemKey[];
}

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
`;

const StyledLabel = styled(Typography)``;
function Label({
  size = 16,
  weight = 900,
  color = "primary",
  style = { display: "inline-block" },
  ...props
}) {
  return (
    <StyledLabel
      size={size}
      weight={weight}
      color={color}
      style={style}
      {...props}
    />
  );
}

const RadioGroup = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
`;

function SettingsForm({
  items = ["slippageTolerance", "txDeadline", "autoRouter"],
}: SettingsFormProps) {
  const slippageTolerance = useSlippageTolerance();
  const txDeadlineMinutes = useTxDeadlineMinutes();
  const theme = useTheme();

  const renderSettingItem = useCallback(
    (key: SettingItemKey) => {
      switch (key) {
        case "slippageTolerance":
          return (
            <>
              <Row
                justify="between"
                align="center"
                css={css`
                  margin-bottom: 16px;
                `}
                gutterWidth={0}
                wrap="nowrap"
              >
                <Col xs="content">
                  <Row justify="start" align="center" gutterWidth={2}>
                    <Label>Slippage Tolerance</Label>
                    <Tooltip content="By slippage tolerance setting, it prevents the ratio of the spread to the amount expected to receive from becoming larger than the set value. High slippage tolerance helps transaction success, but you may get an unexpected price. ">
                      <IconButton size={22} icons={{ default: iconQuestion }} />
                    </Tooltip>
                  </Row>
                </Col>
                <Col xs="content">
                  {(!slippageTolerance.value ||
                    slippageTolerance.value < 0.5) && (
                    <Typography size={14} color="danger">
                      Too low, TX may fail
                    </Typography>
                  )}
                </Col>
              </Row>
              <RadioGroup
                css={css`
                  margin-bottom: 24px;
                `}
              >
                {slippagePresets.map((preset) => (
                  <RadioButton
                    height={40}
                    key={preset}
                    value={preset}
                    name="preset"
                    checked={slippageTolerance.selectedPreset === preset}
                    onChange={() => {
                      slippageTolerance.setSelectedPreset(preset);
                      slippageTolerance.setCustomValue(null);
                    }}
                  >
                    {preset}%
                  </RadioButton>
                ))}
                <NumberInput
                  className={
                    slippageTolerance.selectedPreset === "custom" &&
                    slippageTolerance.customValue
                      ? "active"
                      : ""
                  }
                  css={css`
                    flex: 1;
                    padding: 0;
                  `}
                  borderStyle="solid"
                  variant="default"
                  value={
                    slippageTolerance.selectedPreset === "custom"
                      ? slippageTolerance.customValue ?? ""
                      : ""
                  }
                  onFocus={() => slippageTolerance.setSelectedPreset("custom")}
                  onChange={(e) => {
                    slippageTolerance.setCustomValue(
                      !e.target.value ||
                        Number.isNaN(e.target.value) ||
                        Number.isNaN(Number(e.target.value))
                        ? null
                        : Number(e.target.value),
                    );
                  }}
                  onBlur={() => {
                    if (
                      slippageTolerance.customValue === null ||
                      slippageTolerance.customValue === undefined
                    ) {
                      slippageTolerance.setSelectedPreset("0.5");
                      slippageTolerance.setCustomValue(null);
                    }
                  }}
                  suffix={
                    <Typography
                      color={theme.colors.text.secondary}
                      weight="bold"
                    >
                      %
                    </Typography>
                  }
                  align="right"
                  placeholder={
                    slippageTolerance.selectedPreset !== "custom"
                      ? slippageTolerance.selectedPreset
                      : ""
                  }
                  height={40}
                />
              </RadioGroup>
            </>
          );
        case "txDeadline":
          return (
            <Row
              justify="between"
              align="center"
              css={css`
                margin-bottom: 24px;
              `}
              gutterWidth={0}
              wrap="nowrap"
            >
              <Col xs="content">
                <Row justify="start" align="center" gutterWidth={2}>
                  <Label>Transaction Deadline</Label>
                  <Tooltip content="Transaction will not be executed if it takes longer than the time.">
                    <IconButton size={22} icons={{ default: iconQuestion }} />
                  </Tooltip>
                </Row>
              </Col>
              <Col xs={4} sm={6}>
                <Input
                  className={txDeadlineMinutes.value ? "active" : ""}
                  borderStyle="solid"
                  placeholder="20"
                  suffix={
                    <Typography
                      color={theme.colors.text.secondary}
                      weight="bold"
                    >
                      mins
                    </Typography>
                  }
                  align="right"
                  height={40}
                  value={txDeadlineMinutes.value || ""}
                  onChange={(e) => {
                    txDeadlineMinutes.setValue(
                      !e.target.value ||
                        Number.isNaN(e.target.value) ||
                        Number.isNaN(Number(e.target.value))
                        ? null
                        : Number(e.target.value),
                    );
                  }}
                  maxLength={2}
                />
              </Col>
            </Row>
          );
        case "autoRouter":
          return (
            <Row justify="between" align="center" gutterWidth={0} wrap="nowrap">
              <Col xs="content">
                <Row justify="start" align="center" gutterWidth={2}>
                  <Label color="disabled">Auto Router</Label>
                  <Tooltip
                    content={
                      <>
                        Optimize the best route
                        <br />
                        for the optimal price.
                      </>
                    }
                  >
                    <IconButton size={22} icons={{ default: iconQuestion }} />
                  </Tooltip>
                </Row>
              </Col>
              <Col xs="content">
                <Tooltip content="Coming soon" placement="right">
                  <div>
                    <Switch disabled />
                  </div>
                </Tooltip>
              </Col>
            </Row>
          );
        default:
          return undefined;
      }
    },
    [slippageTolerance, theme, txDeadlineMinutes],
  );

  return (
    <Wrapper>
      {items.map((itemKey) => (
        <React.Fragment key={itemKey}>
          {renderSettingItem(itemKey)}
        </React.Fragment>
      ))}
    </Wrapper>
  );
}

export default SettingsForm;
