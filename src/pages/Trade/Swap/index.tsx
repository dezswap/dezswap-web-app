import { FormEventHandler, useCallback } from "react";
import Typography from "components/Typography";

function SwapPage() {
  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      /* TODO: implement */
    },
    [],
  );

  return (
    <>
      <form onSubmit={handleSubmit} />
      <Typography>Swap</Typography>
    </>
  );
}

export default SwapPage;
