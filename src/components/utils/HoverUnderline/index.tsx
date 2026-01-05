import { ClassNames } from "@emotion/react";
import { Children, cloneElement } from "react";

type HoverUnderlineProps = React.PropsWithChildren<{
  color?: React.CSSProperties["textDecorationColor"];
}>;

function HoverUnderline({
  children,
  color: textDecorationColor,
}: HoverUnderlineProps) {
  return (
    <ClassNames>
      {({ css, cx }) => {
        const hoverCss = css`
          position: relative;
          &:hover::after {
            content: "";
            left: 0;
            top: 100%;
            width: 100%;
            height: 0;
            position: absolute;
            padding-bottom: 1px;
            border-bottom: 1px solid ${textDecorationColor};
          }
        `;
        return Children.map(children, (child, i) => {
          if (!child) {
            return null;
          }
          if (typeof child === "object" && "props" in child) {
            return cloneElement(child, {
              className: cx(child.props.className, hoverCss),
            });
          }
          return <span className={hoverCss}>{child}</span>;
        });
      }}
    </ClassNames>
  );
}

export default HoverUnderline;
