import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Tooltip from "components/Tooltip";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

export interface LineChartProps
  extends Omit<React.SVGProps<SVGSVGElement>, "strokeWidth"> {
  data: number[];
  strokeWidth?: number;
  tooltipRender?: ({
    value,
    index,
  }: {
    value: number;
    index: number;
  }) => React.ReactNode;
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: visible;

  & svg {
    overflow: visible;
    & rect {
      transition: all 0.2s ease-in-out;
    }
  }
`;

function LineChart({
  data,
  strokeWidth = 3,
  tooltipRender,
  ...svgProps
}: LineChartProps) {
  const gradientId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(1);
  const PADDING = height / 10;
  const heightScale = (height - PADDING) / height;
  const viewBox = useMemo(
    () => `${0} ${0} ${width} ${height + strokeWidth * 2}`,
    [height, width, strokeWidth],
  );
  const points = useMemo(() => {
    const { length } = data;
    const max = Math.max(...data);
    return data.map((point, index) => [
      (width * index) / (length - 1),
      height - (height * point) / max + strokeWidth,
    ]);
  }, [data, height, strokeWidth, width]);

  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setWidth(rect.width);
        setHeight(rect.height);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleMouseMove = useCallback<React.MouseEventHandler<SVGSVGElement>>(
    (event) => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (rect) {
        const x = event.clientX - rect.left;
        // const y = event.clientY - rect.top;
        const index = Math.floor((x / width) * points.length);
        setSelectedIndex(index);
      }
    },
    [points, width],
  );

  return (
    <Wrapper ref={wrapperRef}>
      {points?.[selectedIndex] && (
        <div
          css={css`
            position: absolute;
            top: 0;
            width: 2px;
            height: 100%;
            transition: all 0.2s ease-in-out;
            pointer-events: none;
          `}
          style={{
            left: points[selectedIndex][0],
          }}
        >
          <div
            css={css`
              position: absolute;
              left: 0;
              transform: translate(-50%, -50%);
              width: 14px;
              height: 14px;
              border-radius: 50%;
              transition: all 0.2s ease-in-out;
            `}
            style={{
              top:
                (points[selectedIndex][1] / (height + strokeWidth)) *
                height *
                heightScale,
            }}
          >
            <Tooltip
              appendTo="parent"
              content={
                tooltipRender
                  ? tooltipRender({
                      value: data[selectedIndex],
                      index: selectedIndex,
                    })
                  : `${data[selectedIndex]}`
              }
              visible
              arrow={false}
              placement={selectedIndex < points.length / 2 ? "right" : "left"}
            >
              <div />
            </Tooltip>
          </div>
        </div>
      )}

      <svg
        viewBox={viewBox}
        width={width}
        height={height}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setSelectedIndex(-1)}
        {...svgProps}
      >
        <defs>
          <linearGradient id={gradientId} gradientTransform="rotate(90)">
            <stop offset="0" stopColor="#0129bdff" />
            <stop offset="1" stopColor="#f8dcd300" />
          </linearGradient>
        </defs>
        <polygon
          fill={`url(#${gradientId})`}
          points={[
            [0, height],
            ...points.map((point) => [point[0], point[1] * heightScale]),
            [width, height],
            [0, height],
          ]
            .map((point) => point.join(","))
            .join(" ")}
          strokeWidth={strokeWidth}
        />
        <polyline
          points={points
            .map((point) => [point[0], point[1] * heightScale].join(","))
            .join(" ")}
          stroke="#0129bd"
          fill="none"
          strokeWidth={strokeWidth}
        />
        {points?.[selectedIndex] && (
          <>
            <rect
              x={points[selectedIndex][0]}
              y={0}
              height={height}
              width={1}
              fill="#0129bd"
            />
            <circle
              cx={points[selectedIndex][0]}
              cy={points[selectedIndex][1] * heightScale}
              r={7}
              strokeWidth={strokeWidth}
              fill="#f5f5f5"
              stroke="#0129bd"
            />
          </>
        )}
      </svg>
    </Wrapper>
  );
}

export default LineChart;
