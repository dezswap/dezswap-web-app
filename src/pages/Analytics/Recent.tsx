import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Panel from "components/Panel";
import Typography from "components/Typography";
import { MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS } from "constants/layout";
import { useEffect, useMemo, useState } from "react";
import { useScreenClass } from "react-grid-system";

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

const data = [
  { label: "Volume 24H", value: "3999", changeRate: 1.2 },
  { label: "Fees 24H", value: "3999", changeRate: -1.2 },
  { label: "TVL 24H", value: "3999", changeRate: 1.2 },
];

function Recent() {
  const screenClass = useScreenClass();
  const isSmallScreen = [MOBILE_SCREEN_CLASS, TABLET_SCREEN_CLASS].includes(
    screenClass,
  );
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
      return (
        <Panel
          key={item.label}
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
            {item.label}:
          </Typography>
          <Typography size={16} weight={900} color="primary">
            ${item.value}
          </Typography>
          <Typography
            size={16}
            weight={900}
            color={item.changeRate >= 0 ? "positive" : "negative"}
          >
            ({item.changeRate >= 0 ? "↑" : "↓"}
            {item.changeRate})
          </Typography>
        </Panel>
      );
    });
  }, [isSmallScreen]);

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
