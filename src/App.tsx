import { Route, Routes } from "react-router-dom";
import routes, { RouteObject } from "routes";
import { useCallback, useEffect } from "react";
import GlobalStyles from "styles/GlobalStyles";
import {
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

  const renderRoute = useCallback(
    ({ children, element, index, ...props }: RouteObject) => {
      return (
        <Route
          {...(index
            ? { index: true }
            : { children: children?.map(renderRoute) })}
          key={`${props.path}`}
          element={element}
          {...props}
        />
      );
    },
    [],
  );

  return (
    <>
      <GlobalStyles />
      <Routes>{routes.map(renderRoute)}</Routes>
    </>
  );
}

export default App;
