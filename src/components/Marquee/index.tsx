import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

const MarqueeContainer = styled.div`
  display: flex;
  overflow: hidden;
  position: relative;
`;

const MarqueeContent = styled.div<{ isScrolling?: boolean }>`
  width: auto;
  position: relative;
  display: flex;
  white-space: nowrap;
  animation: marquee 20s linear infinite;
  user-select: none;
  touch-action: pan-y;

  &:hover {
    animation-play-state: paused;
  }

  ${({ isScrolling }) =>
    isScrolling &&
    css`
      animation-play-state: paused;
      & > * {
        pointer-events: none;
      }
    `}

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
  const isPointerDown = useRef(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerUp = (event: PointerEvent) => {
      if (event.button === 0) {
        isPointerDown.current = false;
        setIsScrolling(false);
      }
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (isPointerDown.current) {
        const target = contentRef.current;
        if (target) {
          const targetWidth = target.getBoundingClientRect().width;
          const animationDurationMs =
            parseFloat(window.getComputedStyle(target).animationDuration) *
            1000;
          target.getAnimations().forEach((animation) => {
            if (typeof animation.currentTime === "number") {
              if (animation.currentTime < 0) {
                // eslint-disable-next-line no-param-reassign
                animation.currentTime =
                  animationDurationMs + animation.currentTime;
              }
              // eslint-disable-next-line no-param-reassign
              animation.currentTime -=
                (event.movementX * animationDurationMs) / targetWidth;
              setIsScrolling(true);
            }
          });
        }
      }
    };
    const handleDragStart = (event: DragEvent) => {
      const target = event.target as HTMLElement;
      if (contentRef.current?.contains(target)) {
        event.preventDefault();
      }
    };
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("dragstart", handleDragStart);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  return (
    <MarqueeContainer>
      <MarqueeContent
        ref={contentRef}
        isScrolling={isScrolling}
        style={{
          animationDuration:
            typeof duration === "number" ? `${duration}ms` : duration,
          animationDirection,
        }}
        onPointerDown={(event) => {
          if (event.buttons === 1) {
            isPointerDown.current = true;
          }
        }}
      >
        {children}
        <MarqueeDuplicate>{children}</MarqueeDuplicate>
      </MarqueeContent>
    </MarqueeContainer>
  );
}

export default Marquee;
