import "@emotion/react";
import { Colors } from "styles/theme/colors";

declare module "@emotion/react" {
  export interface Theme {
    colors: Colors;
  }
}
