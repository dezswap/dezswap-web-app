import { FormEventHandler, useCallback } from "react";
import Typography from "components/Typography";

function WithdrawPage() {
  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      /* TODO: implement */
    },
    [],
  );

  return (
    <>
      <form onSubmit={handleSubmit} />
      <Typography>Withdraw</Typography>
    </>
  );
}

export default WithdrawPage;
