import { Navigate, Outlet, RouteProps, useLocation } from "react-router-dom";
import PlaygroundPage from "pages/Playground";
import SwapPage from "pages/Trade/Swap";
import ProvidePage from "pages/Earn/Pools/Provide";
import WithdrawPage from "pages/Earn/Pools/Withdraw";
import PoolPage from "pages/Earn/Pools";
import TradePage from "pages/Trade";
import CreatePage from "pages/Earn/Pools/Create";
import Error404 from "pages/Error404";
import EarnPage from "pages/Earn";
import LockdropPage from "pages/Earn/Lockdrop";

export interface RouteObject extends Omit<RouteProps, "children"> {
  children?: RouteObject[];
}

// For legacy links
function ReplaceToEarn() {
  const location = useLocation();
  return (
    <Navigate
      replace
      to={`/earn${location.pathname}`.replace("/pool", "/pools")}
    />
  );
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
    element: <Outlet />,
    children: [
      { index: true, element: <ReplaceToEarn /> },
      {
        path: "create/:asset1Address/:asset2Address",
        element: <ReplaceToEarn />,
      },
      { path: "add-liquidity/:pairAddress", element: <ReplaceToEarn /> },
      { path: "withdraw/:pairAddress", element: <ReplaceToEarn /> },
      { path: "*", element: <Error404 /> },
    ],
  },
  {
    path: "earn",
    element: <EarnPage />,
    children: [
      {
        path: "pools",
        element: <PoolPage />,
        children: [
          {
            path: "create/:asset1Address/:asset2Address",
            element: <CreatePage />,
          },
          { path: "add-liquidity/:pairAddress", element: <ProvidePage /> },
          { path: "withdraw/:pairAddress", element: <WithdrawPage /> },
          { path: "*", element: <Error404 /> },
        ],
      },
      {
        path: "lockdrop",
        element: <LockdropPage />,
      },
      { index: true, element: <Navigate replace to="pools" /> },
    ],
  },
  { index: true, element: <Navigate replace to="trade" /> },
  { path: "*", element: <Error404 /> },
];

export default routes;
