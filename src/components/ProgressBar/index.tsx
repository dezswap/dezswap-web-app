import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import Typography from "components/Typography";
import { useEffect, useMemo, useRef, useState } from "react";

interface ProgressBarProps {
  value: number;
  min?: number;
  max?: number;
  label?: [string, string];
  disabled?: boolean;
  variant?: "default" | "gradient";
  size?: "default" | "small";
  barStyle?: "default" | "rounded";
}

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Row = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
`;

const Bar = styled.div<ProgressBarProps>`
  width: 100%;
  flex: 1;
  position: relative;
  overflow: hidden;

  ${({ size }) => {
    if (size === "small") {
      return css`
        height: 8px;
        border-radius: 30px;
      `;
    }
    return css`
      height: 19px;
      border-radius: 12px;
    `;
  }}

  ${({ variant, theme }) => {
    if (variant === "gradient") {
      return css`
        background-color: #d9d9d9;
        & > div {
          background: ${theme.colors.gradient};
        }
      `;
    }
    return css`
      background-color: ${theme.colors.secondary};

      & > div {
        background-color: ${theme.colors.tertiary};
      }
    `;
  }}

  & > div {
    width: 100%;
    height: 100%;
    ${({ barStyle }) => {
      if (barStyle === "rounded") {
        return css`
          border-radius: 30px;
        `;
      }
      return css`
        border-radius: 12px;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      `;
    }}
    position: absolute;
    top: 0;
    left: 0;
  }

  ${({ disabled, theme }) =>
    disabled &&
    css`
      background-color: ${theme.colors.disabled};
      & > div {
        display: none;
      }
    `}
`;

function ProgressBar(props: ProgressBarProps) {
  const theme = useTheme();

  const { value, min = 0, max = 100, label } = props;

  const progress = useMemo(() => {
    const percent = ((value - min) / (max - min)) * 100;
    if (percent < 0) {
      return 0;
    }
    if (percent > 100) {
      return 100;
    }
    return percent;
  }, [value, min, max]);

  const divRef = useRef<HTMLDivElement>(null);
  const [progressBarWidth, setProgressBarWidth] = useState(100);

  useEffect(() => {
    const handleResize = () => {
      if (divRef.current) {
        setProgressBarWidth(divRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Wrapper ref={divRef}>
      <Row>
        <Bar {...props}>
          <div
            style={{
              width: `${progress}%`,
              paddingLeft: props.variant === "gradient" ? 8 : 0,
              backgroundSize: `${progressBarWidth}px 100%`,
            }}
          />
        </Bar>
      </Row>
      <Row>
        {label?.[0] && (
          <Typography size={14} weight={900} color={theme.colors.tertiary}>
            {label[0]}
          </Typography>
        )}
        {label?.[1] && (
          <Typography size={14} weight={900} color={theme.colors.secondary}>
            {label[1]}
          </Typography>
        )}
      </Row>
    </Wrapper>
  );
}

export default ProgressBar;
