import { RouterProvider } from "react-router-dom";
import routes from "routes";
import { useEffect, useState } from "react";
import GlobalStyles from "styles/GlobalStyles";
import {
  ScreenClassProvider,
  setConfiguration as setGridConfiguration,
  useScreenClass,
} from "react-grid-system";
import { gridConfiguration, SCREEN_CLASSES } from "constants/layout";
import { useWalletManager } from "@interchain-kit/react";

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

  const wm = useWalletManager();
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    wm.init().then(() => {
      setIsInitialized(true);
    });
  }, []);

  return isInitialized ? (
    <ScreenClassProvider>
      <GlobalStyles />
      <RouterProvider router={routes} />
    </ScreenClassProvider>
  ) : (
    <div />
  );
}

export default App;
