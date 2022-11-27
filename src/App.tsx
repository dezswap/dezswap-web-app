import { Route, Routes } from "react-router-dom";
import routes, { RouteObject } from "routes";
import { useCallback } from "react";
import GlobalStyles from "styles/GlobalStyles";

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
