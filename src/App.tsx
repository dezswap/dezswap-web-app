import { Route, Routes } from "react-router-dom";
import routes, { RouteObject } from "routes";
import { Fragment, useCallback, useEffect, useMemo } from "react";
import GlobalStyles from "styles/GlobalStyles";
import {
  setConfiguration as setGridConfiguration,
  useScreenClass,
} from "react-grid-system";
import { gridConfiguration, SCREEN_CLASSES } from "constants/layout";
import { useAtomValue, useSetAtom } from "jotai";
import { verifiedAssetsAtom, verifiedIbcAssetsAtom } from "stores/assets";
import { useAPI } from "hooks/useAPI";
import MainLayout from "layout/Main";
import disclaimerLastSeenAtom from "stores/disclaimer";
import DisclaimerModal from "components/Modal/DisclaimerModal";
import globalElementsAtom from "stores/globalElements";
import { VerifiedIbcAssets } from "types/token";

setGridConfiguration(gridConfiguration);

function App() {
  const setKnownAssets = useSetAtom(verifiedAssetsAtom);
  const setKnownIbcAssets = useSetAtom(verifiedIbcAssetsAtom);
  const disclaimerLastSeen = useAtomValue(disclaimerLastSeenAtom);
  const globalElements = useAtomValue(globalElementsAtom);
  const api = useAPI();
  const screenClass = useScreenClass();
  const isDisclaimerAgreed = useMemo(() => {
    if (!disclaimerLastSeen) return false;
    const date = new Date();
    date.setDate(date.getDate() - 3);
    return disclaimerLastSeen > date;
  }, [disclaimerLastSeen]);

  useEffect(() => {
    SCREEN_CLASSES.forEach((item) => {
      document.body.classList.toggle(item, screenClass === item);
    });
  }, [screenClass]);

  useEffect(() => {
    document.addEventListener("wheel", () => {
      if (
        document.activeElement instanceof HTMLInputElement &&
        document.activeElement.type === "number"
      ) {
        document.activeElement.blur();
      }
    });
  }, []);

  useEffect(() => {
    api.getVerifiedTokenInfo().then((assets) => {
      setKnownAssets(assets);
    });
    api.getVerifiedIbcTokenInfo().then((ibcAssets: VerifiedIbcAssets) => {
      Object.entries(ibcAssets).forEach(([k, v]) => {
        if (v) {
          Object.entries(v).forEach(([kk, kv]) => {
            api.getDecimal(kv?.denom || "").then((d) => {
              if (d && ibcAssets && ibcAssets[k]?.[kk]) {
                setKnownIbcAssets({
                  ...ibcAssets,
                  [k]: {
                    ...ibcAssets[k],
                    [kk]: {
                      ...ibcAssets[k]?.[kk],
                      decimals: d,
                    },
                  },
                } as VerifiedIbcAssets);
              }
            });
          });
        }
      });
    });
  }, [api, setKnownAssets]);

  const renderRoute = useCallback(
    ({ children, element, index, ...props }: RouteObject) => {
      return (
        <Route
          {...(index
            ? { index: true }
            : { children: children?.map(renderRoute) })}
          key={`${props.path}`}
          element={element}
          {...props}
        />
      );
    },
    [],
  );

  return (
    <>
      <GlobalStyles />
      <MainLayout>
        <DisclaimerModal isOpen={!isDisclaimerAgreed} />
        {isDisclaimerAgreed && <Routes>{routes.map(renderRoute)}</Routes>}
      </MainLayout>
      {globalElements.map(({ element, id }) => (
        <Fragment key={id}>{element}</Fragment>
      ))}
    </>
  );
}

export default App;
