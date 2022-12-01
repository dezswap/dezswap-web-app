import { Route, Routes } from "react-router-dom";
import routes, { RouteObject } from "routes";
import { useCallback } from "react";
import GlobalStyles from "styles/GlobalStyles";
import { setConfiguration as setGridConfiguration } from "react-grid-system";

setGridConfiguration({
  // sm, md, lg, xl, xxl, xxxl
  breakpoints: [375, 768, 992, 1280, 1600, 1920],
  containerWidths: [360, 740, 960, 1140, 1540, 1810],
});

function App() {
  const renderRoute = useCallback(({ children, ...props }: RouteObject) => {
    return (
      <Routes key={`${props.path} ${props.index}`} {...props}>
        {children?.map(renderRoute)}
      </Routes>
    );
  }, []);

  return (
    <>
      <GlobalStyles />
      <Routes>{routes.map(renderRoute)}</Routes>
    </>
  );
}

export default App;
