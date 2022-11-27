import { FormEventHandler, useCallback } from "react";

function SwapPage() {
  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      /* TODO: implement */
    },
    [],
  );

  return <form onSubmit={handleSubmit} />;
}

export default SwapPage;
