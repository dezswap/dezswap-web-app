import styled from "@emotion/styled";
import { forwardRef, useEffect, useState } from "react";

import imgDelegateUs from "~/assets/images/img-delegate-us.svg";

const Button = styled.a`
  pointer-events: all;
  position: relative;
  z-index: 1000;
  cursor: pointer;
  border: none;
  outline: none;
  display: block;
  width: 100%;
  height: 0;
  padding: 0;
  padding-bottom: 100%;
  background: none;
  & > svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: absolute;
    left: 0;
    top: 0;
  }

  &:hover * {
    animation: none !important;
    animation-play-state: paused !important;
  }
`;

const DelegateButton = forwardRef<HTMLAnchorElement>(
  function DelegateButton(props, ref) {
    const [svg, setSvg] = useState("");

    useEffect(() => {
      fetch(imgDelegateUs)
        .then((res) => res.text())
        .then((res) => {
          setSvg(res);
        });
    }, []);

    return (
      <Button
        ref={ref}
        href="https://vault.xpla.io/validator/xplavaloper1tple283l3vcaac7x0mqrwtvm3kfe8hlc2d40yl"
        target="_blank"
        rel="noopener noreferrer"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  },
);

export default DelegateButton;
