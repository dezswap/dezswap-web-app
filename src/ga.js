import packageJson from "../package.json";

if (window.location.href.startsWith(packageJson.homepage)) {
  const script = document.createElement("script");
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-Q2DG7CBFRS";
  script.async = true;
  document.body.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push("js", new Date());
  window.dataLayer.push("config", "G-Q2DG7CBFRS");
}
