import React from "react";
import DisclaimerModal from "./DisclaimerModal";
import useDisclaimerAgreement from "./useDisclaimerAgreement";

function withDisclaimerAgreement<P extends object>(
  Component: React.ComponentType<P>,
) {
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
        {isDisclaimerAgreed && <Component {...props} />}
      </>
    );
  }
  return WrappedComponent;
}

export default withDisclaimerAgreement;
