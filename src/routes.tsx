import { Navigate, RouteObject as IRouteObject } from "react-router-dom";
import PlaygroundPage from "pages/Playground";
import SwapPage from "pages/Trade/Swap";
import ProvidePage from "pages/Pool/Provide";
import WithdrawPage from "pages/Pool/Withdraw";
import PoolPage from "pages/Pool";
import TradePage from "pages/Trade";

export interface RouteObject extends Omit<IRouteObject, "children"> {
  children?: RouteObject[];
  isPrivate?: boolean;
}

const routes: RouteObject[] = [
  { path: "playground", element: <PlaygroundPage /> },
  {
    path: "trade",
    element: <TradePage />,
    children: [
      { path: "swap", element: <SwapPage /> },
      { index: true, element: <Navigate replace to="swap" /> },
      { path: "*", element: <Navigate replace to="swap" /> },
    ],
  },
  {
    path: "pool",
    element: <PoolPage />,
    children: [
      { path: "add-liquidity", element: <ProvidePage /> },
      { path: "withdraw", element: <WithdrawPage /> },
      { index: true, element: <Navigate replace to="add-liquidity" /> },
      { path: "*", element: <Navigate replace to="add-liquidity" /> },
    ],
  },
  { index: true, element: <Navigate replace to="trade" /> },
  { path: "*", element: <Navigate replace to="trade" /> },
];

export default routes;
