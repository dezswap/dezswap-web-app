import { Route, Routes } from "react-router-dom";
import routes, { RouteObject } from "routes";
import { useCallback, useEffect, useLayoutEffect } from "react";
import GlobalStyles from "styles/GlobalStyles";
import {
  setConfiguration as setGridConfiguration,
  useScreenClass,
} from "react-grid-system";
import { gridConfiguration, SCREEN_CLASSES } from "constants/layout";
import { useSetAtom } from "jotai";
import { verifiedAssetsAtom } from "stores/assets";
import { useAPI } from "hooks/useAPI";
import MainLayout from "layout/Main";

setGridConfiguration(gridConfiguration);

function App() {
  const setKnownAssets = useSetAtom(verifiedAssetsAtom);
  const api = useAPI();
  const screenClass = useScreenClass();

  useEffect(() => {
    SCREEN_CLASSES.forEach((item) => {
      document.body.classList.toggle(item, screenClass === item);
    });
  }, [screenClass]);

  useEffect(() => {
    api.getVerifiedTokenInfo().then((assets) => {
      setKnownAssets(assets);
    });
  }, [api, setKnownAssets]);

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
      <MainLayout>
        <Routes>{routes.map(renderRoute)}</Routes>
      </MainLayout>
    </>
  );
}

export default App;
