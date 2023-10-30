import styled from "@emotion/styled";

interface LoadingIndicatorProps {
  value: number;
  min?: number;
  max?: number;
}

const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Wrapper = styled.div`
  position: relative;
  width: 24px;
  height: 24px;

  & > svg {
    transform: rotate(-90deg);
  }
  & .frame,
  & .bar {
    fill: none;
  }
  & .frame {
    stroke: transparent;
  }
  & .bar {
    stroke: ${({ theme }) => theme.colors.white};
    stroke-linecap: round;
  }
  & span {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    text-align: center;
    color: ${({ theme }) => theme.colors.white};
    font-size: 12px;
    font-weight: 900;
    line-height: 24px;
  }
`;

function LoadingIndicator({
  value,
  min = 0,
  max = 100,
}: LoadingIndicatorProps) {
  return (
    <Wrapper>
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle className="frame" cx="12" cy="12" r={RADIUS} strokeWidth="2" />
        <circle
          className="bar"
          cx="12"
          cy="12"
          r={RADIUS}
          strokeWidth="2"
          style={{
            strokeDashoffset:
              1 - (CIRCUMFERENCE * (max - min - value)) / (max - min),
            strokeDasharray: CIRCUMFERENCE,
          }}
        />
      </svg>
      <span>{value.toFixed(0)}</span>
    </Wrapper>
  );
}

export default LoadingIndicator;
