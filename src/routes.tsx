import { Navigate, RouteProps } from "react-router-dom";
import PlaygroundPage from "pages/Playground";
import SwapPage from "pages/Trade/Swap";
import ProvidePage from "pages/Pool/Provide";
import WithdrawPage from "pages/Pool/Withdraw";
import PoolPage from "pages/Pool";
import TradePage from "pages/Trade";
import CreatePage from "pages/Pool/Create";
import Error404 from "pages/Error404";

export interface RouteObject extends Omit<RouteProps, "children"> {
  children?: RouteObject[];
}

const routes: RouteObject[] = [
  ...(import.meta.env?.DEV
    ? [{ path: "playground", element: <PlaygroundPage /> }]
    : []),
  {
    path: "trade",
    element: <TradePage />,
    children: [
      { path: "swap", element: <SwapPage /> },
      { index: true, element: <Navigate replace to="swap" /> },
      { path: "*", element: <Error404 /> },
    ],
  },
  {
    path: "pool",
    element: <PoolPage />,
    children: [
      { path: "create/:asset1Address/:asset2Address", element: <CreatePage /> },
      { path: "add-liquidity/:pairAddress", element: <ProvidePage /> },
      { path: "withdraw/:pairAddress", element: <WithdrawPage /> },
      { path: "*", element: <Error404 /> },
    ],
  },
  { index: true, element: <Navigate replace to="trade" /> },
  { path: "*", element: <Error404 /> },
];

export default routes;
