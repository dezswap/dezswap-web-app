import { ThemeProvider } from "@emotion/react";
import App from "App";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import theme from "styles/theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);