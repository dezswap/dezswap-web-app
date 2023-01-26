import { Configuration, ScreenClass } from "react-grid-system";

export const SCREEN_CLASSES: ScreenClass[] = [
  "xs",
  "sm",
  "md",
  "lg",
  // "xl", N/A
  // "xxl", N/A
  // "xxxl", N/A
];

export const MOBILE_SCREEN_CLASS: ScreenClass = "xs";
export const TABLET_SCREEN_CLASS: ScreenClass = "sm";
export const SMALL_BROWSER_SCREEN_CLASS: ScreenClass = "md";
export const LARGE_BROWSER_SCREEN_CLASS: ScreenClass = "lg";

export const DEFAULT_GUTTER_WIDTH = 32;

export const gridConfiguration: Configuration = {
  // Available: (xs), sm, md, lg
  // Disabled: xl, xxl, xxxl
  breakpoints: [600, 1024, 1440],
  containerWidths: [
    940 + DEFAULT_GUTTER_WIDTH,
    1180 + DEFAULT_GUTTER_WIDTH,
    1300 + DEFAULT_GUTTER_WIDTH,
  ],
  defaultScreenClass: LARGE_BROWSER_SCREEN_CLASS,
  maxScreenClass: LARGE_BROWSER_SCREEN_CLASS,
  gutterWidth: DEFAULT_GUTTER_WIDTH,
};

export const MODAL_CLOSE_TIMEOUT_MS = 300;

export const DISPLAY_DECIMAL = 3;

export const MOBILE_DISPLAY_NUMBER_CNT = 20;
export const BROWSER_DISPLAY_NUMBER_CNT = 31;
