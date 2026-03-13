/**
 * Orval input transformer
 * Adds `required` fields to swagger definitions based on Go struct analysis.
 *
 * Go structs use value types (string, bool, uint, float) which always serialize,
 * so only pointer types with `omitempty` are truly optional.
 */

/** @param {import('openapi-types').OpenAPIV2.Document} inputSchema */
export default (inputSchema) => {
  const definitions =
    inputSchema.definitions ??
    inputSchema.components?.schemas ??
    {};

  // Fields that are optional (pointer + omitempty in Go source)
  const optionalFields = {
    "dezswap.AssetInfoTokenRes": ["token", "native_token"],
    "dezswap.AssetInfoRes": ["amount"],
    "dashboard.TokenRes": [
      "volume24hChange",
      "volume7d",
      "volume7dChange",
      "tvlChange",
      "fee",
    ],
  };

  for (const [defName, def] of Object.entries(definitions)) {
    const props = def.properties;
    if (!props) continue;

    const allFields = Object.keys(props);
    const optional = optionalFields[defName] ?? [];
    const required = allFields.filter((f) => !optional.includes(f));

    if (required.length > 0) {
      def.required = required;
    }
  }

  return inputSchema;
};
