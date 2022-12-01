import { Route, Routes } from "react-router-dom";
import routes, { RouteObject } from "routes";
import { useCallback } from "react";
import GlobalStyles from "styles/GlobalStyles";

function App() {
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
