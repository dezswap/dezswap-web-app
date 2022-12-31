/* eslint-disable prefer-rest-params */
/* eslint-disable no-undef */
import packageJson from "../package.json";

if (window.location.href.startsWith(packageJson.homepage)) {
  const script = document.createElement("script");
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-Q2DG7CBFRS";
  script.async = true;
  document.head.appendChild(script);
}

window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
window.gtag = gtag;
gtag("js", new Date());
gtag("config", "G-Q2DG7CBFRS");
