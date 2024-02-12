import useLocalStorage from "hooks/useLocalStorage";
import { useMemo } from "react";

const useDisclaimerAgreement = () => {
  const [disclaimerLastSeen, setDisclaimerLastSeen] = useLocalStorage(
    "disclaimer",
    0,
  );

  const isDisclaimerAgreed = useMemo(() => {
    if (!disclaimerLastSeen) return false;
    const date = new Date();
    date.setDate(date.getDate() - 3);
    return new Date(disclaimerLastSeen) > date;
  }, [disclaimerLastSeen]);

  const agreeDisclaimer = () => {
    setDisclaimerLastSeen(Date.now());
  };

  return {
    isDisclaimerAgreed,
    agreeDisclaimer,
  };
};

export default useDisclaimerAgreement;
