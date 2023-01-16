import styled from "@emotion/styled";
import iconCopy from "assets/icons/icon-copy.svg";
import iconCopyHover from "assets/icons/icon-copy-hover.svg";
import iconCopyDisabled from "assets/icons/icon-copy-disabled.svg";
import { useCallback, useRef } from "react";
import Tooltip from "components/Tooltip";
import { css } from "@emotion/react";

type CopyProps = React.PropsWithChildren<{
  value?: string;
  size?: React.CSSProperties["width"];
  disabled?: boolean;
}>;

const Wrapper = styled.button`
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  background: none;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;

  & > textarea:first-of-type {
    width: 0;
    height: 0;
    position: absolute;
    pointer-events: none;
    left: 0;
    top: 0;
    border: none;
    padding: 0;
    margin: 0;
    opacity: 0;
  }
`;

const CopyIcon = styled.div<Pick<CopyProps, "size">>`
  ${({ size = 32 }) => {
    const computedSize = typeof size === "number" ? `${size}px` : size;
    return css`
      width: ${computedSize};
      height: ${computedSize};
    `;
  }}
  position: relative;
  cursor: pointer;
  background-image: url(${iconCopy});
  background-position: 50% 50%;
  background-size: contain;
  background-repeat: no-repeat;

  &:hover {
    background-image: url(${iconCopyHover});
  }

  button:disabled & {
    background-image: url(${iconCopyDisabled});
    cursor: default;
  }
`;

function Copy({ value, size, children, disabled }: CopyProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      if (navigator?.clipboard?.writeText) {
        navigator?.clipboard?.writeText(inputRef?.current?.innerHTML || "");
      } else {
        inputRef?.current?.focus();
        inputRef?.current?.select();
        document.execCommand("copy");
      }

      if (event.currentTarget) {
        event.currentTarget.blur();
      }

      event.stopPropagation();
    },
    [],
  );

  return (
    <Wrapper onClick={handleClick} disabled={disabled || !value} type="button">
      <textarea ref={inputRef} value={value} readOnly />
      {children || (
        <Tooltip
          arrow
          content="Copied!"
          trigger="click"
          onShow={(instance) => {
            setTimeout(() => {
              instance.hide();
            }, 1000);
          }}
          disabled={disabled || !value}
        >
          <CopyIcon size={size} />
        </Tooltip>
      )}
    </Wrapper>
  );
}

export default Copy;
