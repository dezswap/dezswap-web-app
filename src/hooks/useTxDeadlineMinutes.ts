import { useAtom } from "jotai";

import { txDeadlineMinutesAtom } from "~/stores/settings";

const useTxDeadlineMinutes = () => {
  const [value, setValue] = useAtom(txDeadlineMinutesAtom);

  return {
    value,
    setValue,
  };
};

export default useTxDeadlineMinutes;
