import { FormEventHandler, useCallback } from "react";

function WithdrawPage() {
  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      /* TODO: implement */
    },
    [],
  );

  return <form onSubmit={handleSubmit} />;
}

export default WithdrawPage;
