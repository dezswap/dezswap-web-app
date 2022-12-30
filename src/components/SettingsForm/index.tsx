import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import IconButton from "components/IconButton";
import { NumberInput } from "components/Input";
import RadioButton from "components/RadioButton";
import Tooltip from "components/Tooltip";
import Typography from "components/Typography";
import { Col, Row } from "react-grid-system";
import { slippagePresets } from "stores/settings";

import iconQuestion from "assets/icons/icon-question.svg";
import useSlippageTolerance from "hooks/useSlippageTolerance";
import ToggleButton from "components/ToggleButton";
import useTxDeadlineMinutes from "hooks/useTxDeadlineMinutes";

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
  const txDeadlineMinutes = useTxDeadlineMinutes();
  const theme = useTheme();
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
            <Tooltip
              arrow
              content="When you select asset pair and input how much you want to swap, Dezswap simulates the result and shows the expected amount. But the number can vary by the timing between you simulated and the unexpected swap transaction executed. If you set the number of it, your swap transaction raises failure if the actual result is different from the simulated result. The number is your allowance of the difference(may be loss)."
            >
              <IconButton size={22} icons={{ default: iconQuestion }} />
            </Tooltip>
          </Row>
        </Col>
        <Col xs="content">
          {(!slippageTolerance.value || slippageTolerance.value < 5) && (
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
          variant="default"
          defaultValue={slippageTolerance.customValue}
          onFocus={() => slippageTolerance.setSelectedPreset("custom")}
          onChange={(e) => {
            slippageTolerance.setCustomValue(Number(e.target.value));
          }}
          suffix={
            <Typography color={theme.colors.text.secondary} weight="bold">
              %
            </Typography>
          }
          align="right"
          placeholder="0.5"
          height={40}
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
            <Tooltip
              arrow
              content="If the chain network is too busy to process, your transaction would not be executed and could be remain on the memory queue. But if it remains long time, the swap rate could be different and it could cause your loss. If you set this parameter, your swap transaction will only be valid within the given time range and will raise an error when your transaction is executed after the given lifetime."
            >
              <IconButton size={22} icons={{ default: iconQuestion }} />
            </Tooltip>
          </Row>
        </Col>
        <Col xs={4} sm={6}>
          <NumberInput
            borderStyle="solid"
            placeholder="20"
            suffix={
              <Typography color={theme.colors.text.secondary} weight="bold">
                mins
              </Typography>
            }
            align="right"
            height={40}
            value={txDeadlineMinutes.value}
            onChange={(e) => {
              txDeadlineMinutes.setValue(Number(e.target.value));
            }}
            step={1}
            min={0}
            max={99}
            maxLength={2}
          />
        </Col>
      </Row>
      <Row justify="between" align="center" gutterWidth={0} wrap="nowrap">
        <Col xs="content">
          <Row justify="start" align="center" gutterWidth={2}>
            <Label>Auto Router</Label>
            <Tooltip
              arrow
              content="If there is no direct pair between two assets, Dezswap helps finding the best path from the all possible multihop swaps."
            >
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
