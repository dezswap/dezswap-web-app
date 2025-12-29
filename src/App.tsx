import { useEffect } from "react";
import {
  ScreenClassProvider,
  setConfiguration as setGridConfiguration,
  useScreenClass,
} from "react-grid-system";
import { RouterProvider } from "react-router-dom";

import { SCREEN_CLASSES, gridConfiguration } from "~/constants/layout";

import GlobalStyles from "~/styles/GlobalStyles";

import routes from "./routes";

setGridConfiguration(gridConfiguration);

function App() {
  const screenClass = useScreenClass();

  useEffect(() => {
    SCREEN_CLASSES.forEach((item) => {
      document.body.classList.toggle(item, screenClass === item);
    });
  }, [screenClass]);

  useEffect(() => {
    document.addEventListener("wheel", () => {
      if (
        document.activeElement instanceof HTMLInputElement &&
        document.activeElement.type === "number"
      ) {
        document.activeElement.blur();
      }
    });
  }, []);

  return (
    <ScreenClassProvider>
      <GlobalStyles />
      <RouterProvider router={routes} />
    </ScreenClassProvider>
  );
}

export default App;
