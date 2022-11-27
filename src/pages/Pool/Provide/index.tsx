import { FormEventHandler, useCallback } from "react";

function ProvidePage() {
  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      /* TODO: implement */
    },
    [],
  );

  return <form onSubmit={handleSubmit} />;
}

export default ProvidePage;
