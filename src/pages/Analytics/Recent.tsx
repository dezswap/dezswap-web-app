import { css } from "@emotion/react";
import styled from "@emotion/styled";
import ChangeRateFormatter from "components/ChangeRateFormatter";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import useDashboard from "hooks/useDashboard";
import { useEffect, useMemo, useState } from "react";
import { useScreenClass } from "react-grid-system";
import { formatDecimals, formatCurrency } from "utils";

const List = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  column-gap: 30px;
  & > div {
    width: auto;
  }

  transition: transform 0.5s ease-in-out;

  .${MOBILE_SCREEN_CLASS} &,
  .${TABLET_SCREEN_CLASS} & {
    flex-direction: column;
    & > div {
      width: 100%;
    }
  }
`;

function Recent() {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
  const { recent } = useDashboard();

  const data = useMemo(() => {
    return [
      {
        label: "Volume 24H",
        value: formatCurrency(recent?.volume || "0"),
        changeRate: recent?.volumeChangeRate,
      },
      {
        label: "Fees 24H",
        value: formatCurrency(recent?.fee || "0"),
        changeRate: recent?.feeChangeRate,
      },
      {
        label: "TVL 24H",
        value: formatCurrency(recent?.tvl || "0"),
        changeRate: recent?.tvlChangeRate,
      },
    ];
  }, [recent]);

  const count = data.length;
  const [sliderIndex, setSliderIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSliderIndex((current) => (current + 1) % count);
    }, 3000);
    return () => {
      clearInterval(intervalId);
    };
  }, [count]);

  const items = useMemo(() => {
    return data.map((item, index, array) => {
      const { label, value, changeRate = 0 } = item;
      return (
        <Panel
          key={label}
          border={false}
          css={css`
            display: flex;
            gap: 6px;
            justify-content: flex-start;
            align-items: center;
            line-height: 1;
          `}
          style={
            !isSmallScreen
              ? {
                  ...(index > 0 && { paddingLeft: 0 }),
                  ...(index < array.length - 1 && { paddingRight: 0 }),
                }
              : undefined
          }
        >
          <Typography size={16} weight={900} color="primary">
            {label}:
          </Typography>
          <Typography size={16} weight={900} color="primary">
            {value}
          </Typography>
          <Typography size={16} weight={900}>
            <ChangeRateFormatter rate={changeRate} />
          </Typography>
        </Panel>
      );
    });
  }, [data, isSmallScreen]);

  return (
    <Panel
      shadow
      noPadding
      css={css`
        overflow: hidden;
      `}
    >
      {/* Offset */}
      <div
        css={css`
          pointer-events: none;
          opacity: 0;
        `}
      >
        {items[0]}
      </div>
      <List
        style={
          isSmallScreen
            ? { transform: `translateY(-${(100 / count) * sliderIndex}%)` }
            : undefined
        }
      >
        {items}
      </List>
    </Panel>
  );
}

export default Recent;
