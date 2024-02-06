import { ThemeProvider } from "@emotion/react";
import { getChainOptions, WalletProvider } from "@xpla/wallet-provider";
import App from "App";
import ReactDOM from "react-dom/client";
import theme from "styles/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "simplebar";
import "simplebar/dist/simplebar.css";
import ResizeObserver from "resize-observer-polyfill";
import { Numeric } from "@xpla/xpla.js";

window.ResizeObserver = ResizeObserver;

const originalNumericParse = Numeric.parse;
Numeric.parse = (value) => {
  try {
    return originalNumericParse(value);
  } catch (error) {
    console.log(error);
  }
  return originalNumericParse(0);
};

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root")!);
getChainOptions().then((chainOptions) => {
  root.render(
    <WalletProvider {...chainOptions}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </WalletProvider>,
  );
});
