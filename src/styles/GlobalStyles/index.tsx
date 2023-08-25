import { css, Global, useTheme } from "@emotion/react";
import { MODAL_CLOSE_TIMEOUT_MS } from "constants/layout";
import reset from "emotion-reset";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/svg-arrow.css";

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

          *,
          *::after,
          *::before {
            box-sizing: border-box;
            font-family: "Nunito", sans-serif;
            outline: none;
          }

          a:active {
            text-decoration: none;
          }
        `}
      />
      {/* React Modal */}
      <Global
        styles={css`
          .ReactModal__Body--open:not(:has(.ReactModal__Overlay.inner-modal)),
          .ReactModal__Body--open:has(
              .ReactModal__Overlay .ReactModal__Overlay.inner-modal
            ) {
            overflow: hidden;
          }
          .ReactModal__Overlay {
            opacity: 0;
            transition: transform ${`${MODAL_CLOSE_TIMEOUT_MS}ms`} ease-out;
            z-index: 6000;
            backdrop-filter: blur(4px);
            position: fixed;
            inset: 0;
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
              transform: translateY(0px) scale(1);
              transition: transform ${`${MODAL_CLOSE_TIMEOUT_MS}ms`} ease-out;
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

            &.no-overlay {
              backdrop-filter: unset;
              &::before {
                content: unset;
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
            opacity: 1;
            & .ReactModal__Content {
              transform: translateY(0px) scale(1);

              &.bottom-drawer {
                transform: translateY(100%) scale(1);
              }
            }
          }

          & .modal-parent:has(.inner-modal) > div:first-of-type {
            opacity: 0;
            transition: opacity 10ms step-end;
          }
        `}
      />
      {/* Tippy.js */}
      <Global
        /* // TODO: arrow style  */
        styles={css`
          .tippy-box[data-theme~="light-border"] {
            background-color: ${theme.colors.white};
            background-clip: padding-box;
            border: 3px solid ${theme.colors.primary};
            color: ${theme.colors.primary};
            box-shadow: unset;
            border-radius: 8px;
            &,
            & > * {
              opacity: 1 !important;
            }

            & > .tippy-content {
              padding: 12px;
              line-height: normal;
              font-size: 14px;
              font-weight: 700;
            }
            & > .tippy-backdrop {
              background-color: ${theme.colors.white};
            }
            & > .tippy-arrow:after,
            & > .tippy-svg-arrow:after {
              content: "";
              position: absolute;
              z-index: -1;
            }
            & > .tippy-arrow:after {
              border-color: transparent;
              border-style: solid;
              border-radius: 8px !important;
            }
            &[data-placement^="top"] > .tippy-arrow:before {
              border-top-color: ${theme.colors.white};
            }
            &[data-placement^="top"] > .tippy-arrow:after {
              border-top-color: ${theme.colors.primary};
              border-width: 6px 6px 0;
              top: 18px;
              left: 2.5px;
              transform: scale(1.5) translateY(0px);
            }
            &[data-placement^="top"] > .tippy-svg-arrow > svg {
              top: 27px;
            }
            &[data-placement^="top"] > .tippy-svg-arrow:after {
              top: 17px;
            }
            &[data-placement^="bottom"] > .tippy-arrow:before {
              border-bottom-color: ${theme.colors.white};
              bottom: 16px;
            }
            &[data-placement^="bottom"] > .tippy-arrow:after {
              border-bottom-color: ${theme.colors.primary};
              border-width: 0 6px 6px;
              bottom: 19px;
              left: 2.5px;
              transform: scale(1.5) translateY(0px);
            }
            &[data-placement^="bottom"] > .tippy-svg-arrow > svg {
              bottom: 27px;
            }
            &[data-placement^="bottom"] > .tippy-svg-arrow:after {
              bottom: 17px;
            }
            &[data-placement^="left"] > .tippy-arrow:before {
              border-left-color: ${theme.colors.white};
            }
            &[data-placement^="left"] > .tippy-arrow:after {
              border-left-color: ${theme.colors.primary};
              border-width: 7px 0 7px 7px;
              left: 17px;
              top: 1px;
              transform: scale(1.5) translateX(1px);
            }
            &[data-placement^="left"] > .tippy-svg-arrow > svg {
              left: 18.5px;
            }
            &[data-placement^="left"] > .tippy-svg-arrow:after {
              left: 12px;
            }
            &[data-placement^="right"] > .tippy-arrow:before {
              border-right-color: ${theme.colors.white};
              right: 16px;
            }
            &[data-placement^="right"] > .tippy-arrow:after {
              border-width: 7px 7px 7px 0;
              right: 17px;
              top: 1px;
              border-right-color: ${theme.colors.primary};
              transform: scale(1.5) translateX(-1px);
            }
            &[data-placement^="right"] > .tippy-svg-arrow > svg {
              right: 19px;
            }
            &[data-placement^="right"] > .tippy-svg-arrow:after {
              right: 12px;
            }
            & > .tippy-svg-arrow {
              width: 28px;
              height: 28px;
              & > svg {
                width: 28px;
                height: 10.2px;
              }
            }
            & > .tippy-svg-arrow::after {
              content: unset;
            }
          }
        `}
      />
      {/* Scrollbars */}
      <Global
        styles={css`
          * {
            scrollbar-width: thin;
            scrollbar-color: ${theme.colors.secondary} transparent;
            &::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }

            [data-simplebar]::-webkit-scrollbar {
              display: none;
            }
            &::-webkit-scrollbar-thumb {
              background-color: ${theme.colors.secondary};
              border-radius: 30px;
            }
            &::-webkit-scrollbar-track {
              background-color: transparent;
            }
          }

          .simplebar-track {
            &.simplebar-vertical {
              width: 8px;
            }
            &.simplebar-horizontal {
              height: 8px;
            }
          }

          .simplebar-scrollbar {
            &.simplebar-visible::before {
              opacity: 1;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
            }
            &::before {
              background-color: ${theme.colors.secondary};
              opacity: 1;
            }
          }
        `}
      />
    </>
  );
}

export default GlobalStyles;
