import { ThemeProvider } from "@emotion/react";
import { getChainOptions, WalletProvider } from "@xpla/wallet-provider";
import App from "App";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import theme from "styles/theme";
import { QueryClient, QueryClientProvider } from "react-query";
import "simplebar";
import "simplebar/dist/simplebar.css";
import ResizeObserver from "resize-observer-polyfill";

window.ResizeObserver = ResizeObserver;

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root")!);
getChainOptions().then((chainOptions) => {
  root.render(
    <WalletProvider {...chainOptions}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </WalletProvider>,
  );
});
