import React from "react";
import styled from "@emotion/styled";

const MarqueeContainer = styled.div`
  display: flex;
  overflow: hidden;
  position: relative;
`;

const MarqueeContent = styled.div`
  width: auto;
  position: relative;
  display: flex;
  white-space: nowrap;
  animation: marquee 20s linear infinite;
  &:hover {
    animation-play-state: paused;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }
`;

const MarqueeDuplicate = styled.div`
  position: absolute;
  top: 0;
  left: 100%;
`;

interface MarqueeProps extends React.PropsWithChildren {
  duration?: number | React.CSSProperties["animationDuration"];
  direction?: "left" | "right";
}

function Marquee({ children, duration, direction = "left" }: MarqueeProps) {
  const animationDirection = direction === "left" ? "normal" : "reverse";
  return (
    <MarqueeContainer>
      <MarqueeContent
        style={{
          animationDuration:
            typeof duration === "number" ? `${duration}ms` : duration,
          animationDirection,
        }}
      >
        {children}
        <MarqueeDuplicate>{children}</MarqueeDuplicate>
      </MarqueeContent>
    </MarqueeContainer>
  );
}

export default Marquee;
