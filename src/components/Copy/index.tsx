import styled from "@emotion/styled";
import iconCopy from "assets/icons/icon-copy.svg";
import iconCopyHover from "assets/icons/icon-copy-hover.svg";
import { useCallback, useRef } from "react";
import Tooltip from "components/Tooltip";

type CopyProps = React.PropsWithChildren<{
  value?: string;
}>;

const Wrapper = styled.button`
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  background: none;
  cursor: pointer;
  border: none;

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

const CopyIcon = styled.div`
  width: 32px;
  height: 32px;
  position: relative;
  cursor: pointer;
  background-image: url(${iconCopy});
  background-position: 50% 50%;
  background-size: contain;
  background-repeat: no-repeat;

  &:hover {
    background-image: url(${iconCopyHover});
  }
`;

function Copy({ value, children }: CopyProps) {
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
    <Wrapper onClick={handleClick} type="button">
      <textarea ref={inputRef} value={value} readOnly />
      {children || (
        <Tooltip arrow content="Copied!" trigger="click">
          <CopyIcon />
        </Tooltip>
      )}
    </Wrapper>
  );
}

export default Copy;
