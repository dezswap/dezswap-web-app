import {
  Navigate,
  RouteObject as IRouteObject,
} from "react-router-dom";
import PlaygroundPage from "pages/Playground";

export interface RouteObject extends Omit<IRouteObject, "children"> {
  children?: RouteObject[];
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  isPrivate?: boolean;
}

const routes: RouteObject[] = [
  {
    path: "playground",
    element: <PlaygroundPage />,
  },
  { index: true, element: <Navigate replace to="playground" /> },
];

export default routes;
