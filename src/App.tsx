import { RouterProvider } from "react-router-dom";
import routes from "routes";
import { useEffect } from "react";
import GlobalStyles from "styles/GlobalStyles";
import {
  ScreenClassProvider,
  setConfiguration as setGridConfiguration,
  useScreenClass,
} from "react-grid-system";
import { gridConfiguration, SCREEN_CLASSES } from "constants/layout";

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
