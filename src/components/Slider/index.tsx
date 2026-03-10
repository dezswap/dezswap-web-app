import { css } from "@emotion/react";
import styled from "@emotion/styled";
import RCSlider, { SliderProps as RCSliderProps } from "rc-slider";
import "rc-slider/assets/index.css";
import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";

import Typography from "~/components/Typography";

interface SliderProps extends RCSliderProps {
  showValue?: boolean;
  transformValue?: (value: number) => ReactNode;
}

const Wrapper = styled.div`
  position: relative;
  padding: 0;

  .rc-slider {
    height: 28px;
    padding: 9px 0;
    &-disabled {
      background-color: unset;
    }

    &-handle {
      border: none !important;
      background-color: ${({ theme }) => theme.colors.primary} !important;
      box-shadow: none !important;
      width: 14px;
      height: 28px;
      margin-top: -9px;
      border-radius: 2px;
      opacity: 1;
      transform: translateX(0);
      z-index: 2;

      &-dragging {
        border-color: ${({ theme }) => theme.colors.primary} !important;
        box-shadow: none !important;
      }
    }
    &-step {
      height: 10px;
    }
    &-track {
      background: ${({ theme }) => theme.colors.gradient};
      height: 10px;
    }
    &-rail {
      width: 100%;
      background-color: ${({ theme }) => theme.colors.text.placeholder};
      height: 10px;
    }
    &-dot {
      display: none;
    }

    /* To prevent unexpected bubbling */
    &::after {
      content: "";
      width: 1000vw;
      height: 1000vh;
      position: fixed;
      left: -50vw;
      top: -50vh;
      background-color: transparent;
      z-index: 50000;
      display: none;
      transition: display 0.2s step-end;
    }

    &:has(.rc-slider-handle-dragging)::after {
      display: block;
    }
  }
`;

function SliderHandle({
  origin,
  props,
  transformValue = (value) => value,
}: {
  origin: Parameters<Required<RCSliderProps>["handleRender"]>[0];
  props: Parameters<Required<RCSliderProps>["handleRender"]>[1];
  transformValue?: SliderProps["transformValue"];
}): ReactElement {
  return (
    <>
      {origin}
      <Typography
        style={origin.props.style}
        color="primary"
        weight={700}
        css={css`
          position: absolute;
          top: 100%;
          white-space: nowrap;
        `}
      >
        {transformValue(props.value)}
      </Typography>
    </>
  );
}

function Slider({
  showValue,
  transformValue,
  trackStyle,
  ...rcSliderProps
}: SliderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperWidth, setWrapperWidth] = useState(
    wrapperRef.current?.offsetWidth,
  );
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        setWrapperWidth(wrapperRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <Wrapper ref={wrapperRef}>
      <RCSlider
        trackStyle={{ backgroundSize: `${wrapperWidth}px 100%`, ...trackStyle }}
        handleRender={
          showValue
            ? // eslint-disable-next-line react/no-unstable-nested-components
              (origin, props) => {
                return (
                  <SliderHandle
                    origin={origin}
                    props={props}
                    transformValue={transformValue}
                  />
                );
              }
            : undefined
        }
        {...rcSliderProps}
      />
    </Wrapper>
  );
}

export default Slider;
