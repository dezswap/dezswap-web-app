import React from "react";

import DisclaimerModal from "./DisclaimerModal";
import useDisclaimerAgreement from "./useDisclaimerAgreement";

function withDisclaimerAgreement<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  function WrappedComponent(props: P) {
    const { isDisclaimerAgreed, agreeDisclaimer } = useDisclaimerAgreement();

    return (
      <>
        <DisclaimerModal
          isOpen={!isDisclaimerAgreed}
          onAgree={() => {
            agreeDisclaimer();
          }}
        />
        {isDisclaimerAgreed && React.createElement(Component, props)}
      </>
    );
  }

  WrappedComponent.displayName = `withDisclaimerAgreement(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
}

export default withDisclaimerAgreement;
