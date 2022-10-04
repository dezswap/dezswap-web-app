import { css, Global } from "@emotion/react";
import reset from "emotion-reset";

function GlobalStyles() {
  return (
      <Global
        styles={css`
          ${reset}
        `}
      />
  );
}

export default GlobalStyles;
