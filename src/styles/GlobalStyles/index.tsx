import { css, Global, useTheme } from "@emotion/react";
import reset from "emotion-reset";

function GlobalStyles() {
  const theme = useTheme();
  return (
    <Global
      styles={css`
        ${reset}
        body,
          html {
          width: 100%;
          height: 100%;
          position: relative;
          font-family: "Nunito", sans-serif;
          background-color: ${theme.colors.background};
        }

        #root {
          & > div {
            overflow-x: hidden;
          }
        }

        * {
          box-sizing: border-box;

          scrollbar-width: thin;
          scrollbar-color: ${theme.colors.secondary} transparent;
          &::-webkit-scrollbar {
            width: 8px;
          }
          &::-webkit-scrollbar-thumb {
            background-color: ${theme.colors.secondary};
            border-radius: 30px;
          }
          &::-webkit-scrollbar-track {
            background-color: transparent;
          }
        }
      `}
    />
  );
}

export default GlobalStyles;
