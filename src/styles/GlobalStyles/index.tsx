import { css, Global } from "@emotion/react";
import reset from "emotion-reset";
import theme from "../theme";

function GlobalStyles() {
  return (
      <Global
        styles={css`
          ${reset}
          body,
          html {
            width: 100%;
            position: relative;
            overflow-x: hidden;
            font-family: "Nunito", sans-serif;
            background-color: ${theme.colors.background};
          }
        `}
      />
  );
}

export default GlobalStyles;
