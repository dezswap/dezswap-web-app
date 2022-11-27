import { FormEventHandler, useCallback } from "react";
import Typography from "components/Typography";

function ProvidePage() {
  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (event) => {
      /* TODO: implement */
    },
    [],
  );

  return (
    <>
      <form onSubmit={handleSubmit} />
      <Typography>Add Liquidity</Typography>
    </>
  );
}

export default ProvidePage;
