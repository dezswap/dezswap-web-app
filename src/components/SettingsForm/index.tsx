import { css } from "@emotion/react";
import styled from "@emotion/styled";
import IconButton from "components/IconButton";
import { NumberInput } from "components/Input";
import RadioButton from "components/RadioButton";
import Tooltip from "components/Tooltip";
import Typography from "components/Typography";
import { Col, Row } from "react-grid-system";
import { slippagePresets } from "stores/slippageTolerance";

import iconQuestion from "assets/icons/icon-question.svg";
import useSlippageTolerance from "hooks/useSlippageTolerance";
import ToggleButton from "components/ToggleButton";

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
`;

const Label = styled(Typography)``;
Label.defaultProps = {
  size: 16,
  weight: 900,
  color: "primary",
  style: { display: "inline-block" },
};

const RadioGroup = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
`;

function SettingsForm() {
  const slippageTolerance = useSlippageTolerance();
  return (
    <Wrapper>
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
            <Tooltip content="">
              <IconButton size={22} icons={{ default: iconQuestion }} />
            </Tooltip>
          </Row>
        </Col>
        <Col xs="content">
          {(!slippageTolerance.value || slippageTolerance.value <= 0.5) && (
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
            key={preset}
            value={preset}
            name="preset"
            checked={slippageTolerance.selectedPreset === preset}
            onChange={() => slippageTolerance.setSelectedPreset(preset)}
          >
            {preset}%
          </RadioButton>
        ))}
        <NumberInput
          css={css`
            flex: 1;
            padding: 0;
          `}
          borderStyle="solid"
          variant={
            slippageTolerance.selectedPreset === "custom"
              ? "primary"
              : "default"
          }
          defaultValue={slippageTolerance.customValue}
          onFocus={() => slippageTolerance.setSelectedPreset("custom")}
          onChange={(e) => {
            slippageTolerance.setCustomValue(Number(e.target.value));
          }}
          suffix="%"
          align="right"
          placeholder="0.5"
        />
      </RadioGroup>
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
            <Tooltip content="">
              <IconButton size={22} icons={{ default: iconQuestion }} />
            </Tooltip>
          </Row>
        </Col>
        <Col xs={4} sm={6}>
          <NumberInput
            borderStyle="solid"
            placeholder="20"
            suffix="mins"
            align="right"
          />
        </Col>
      </Row>
      <Row justify="between" align="center" gutterWidth={0} wrap="nowrap">
        <Col xs="content">
          <Row justify="start" align="center" gutterWidth={2}>
            <Label>Auto Router</Label>
            <Tooltip content="">
              <IconButton size={22} icons={{ default: iconQuestion }} />
            </Tooltip>
          </Row>
        </Col>
        <Col xs="content">
          <ToggleButton />
        </Col>
      </Row>
    </Wrapper>
  );
}

export default SettingsForm;
