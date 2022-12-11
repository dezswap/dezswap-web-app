import { css, Global, useTheme } from "@emotion/react";
import reset from "emotion-reset";

function GlobalStyles() {
  const theme = useTheme();
  return (
    <>
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
      {/* React Modal */}
      <Global
        styles={css`
          .ReactModal__Body--open {
            overflow: hidden;
          }
          .ReactModal__Overlay {
            opacity: 0;
            transition: opacity 0.125s ease-in-out, transform 0.125s ease-in-out;
            z-index: 6000;
            backdrop-filter: blur(4px);
            &::before {
              content: "";
              width: 100%;
              height: 100%;
              position: absolute;
              left: 0;
              top: 0;
              background-color: ${theme.colors.background};
              opacity: 0.8;
              pointer-events: none;
            }

            & .ReactModal__Content {
              transform: translateY(-16px) scale(0.9);
              transition: opacity 0.125s ease-in-out,
                transform 0.125s ease-in-out;
              display: flex;
              align-items: center;
              justify-content: center;

              &.bottom-drawer {
                transform: translateY(100%) scale(1);
                margin-top: auto;

                & > div {
                  padding-left: 0 !important;
                  padding-right: 0 !important;
                }
              }
            }
          }

          .ReactModal__Overlay--after-open {
            opacity: 1;
            & .ReactModal__Content {
              transform: translateY(0px) scale(1);

              &.bottom-drawer {
                transform: translateY(0px) scale(1);
              }
            }
          }

          .ReactModal__Overlay--before-close {
            opacity: 0;
            & .ReactModal__Content {
              transform: translateY(-16px) scale(0.9);

              &.bottom-drawer {
                transform: translateY(100%) scale(1);
              }
            }
          }
        `}
      />
    </>
  );
}

export default GlobalStyles;
