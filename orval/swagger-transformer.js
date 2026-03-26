/**
 * Orval input transformer (operates on OpenAPI 3.1 spec)
 *
 * 1. Adds `required` fields based on Go struct analysis
 *    (Go value types always serialize; only pointer+omitempty are optional)
 * 2. Converts discriminated unions to `oneOf`
 * 3. Converts fixed-length arrays to tuples via `prefixItems` (OpenAPI 3.1)
 */

// Fields that are optional (pointer + omitempty in Go source)
const optionalFields = {
  "dezswap.AssetInfoRes": ["amount"],
  "dashboard.TokenRes": [
    "volume24hChange",
    "volume7d",
    "volume7dChange",
    "tvlChange",
    "fee",
  ],
};

// Discriminated unions: Go structs using pointer fields as oneOf variants
// At runtime, exactly one field is set (if-else in Go)
const oneOfSchemas = {
  "dezswap.AssetInfoTokenRes": ["token", "native_token"],
};

// Fixed-length arrays that should be tuples (OpenAPI 3.1 prefixItems)
// { "schemaName": { "fieldName": count } }
const tupleFields = {
  "controller.PoolRes": { assets: 2 },
  "controller.PairRes": { asset_infos: 2, asset_decimals: 2 },
};

/** @param {import('openapi-types').OpenAPIV3.Document} inputSchema */
export default (inputSchema) => {
  const schemas = inputSchema.components?.schemas ?? {};

  // Add required fields
  for (const [schemaName, schema] of Object.entries(schemas)) {
    const props = schema.properties;
    if (!props) continue;

    const allFields = Object.keys(props);
    const optional = optionalFields[schemaName] ?? [];
    const required = allFields.filter((f) => !optional.includes(f));

    if (required.length > 0) {
      schema.required = required;
    }
  }

  // Apply oneOf for discriminated unions
  for (const [schemaName, fields] of Object.entries(oneOfSchemas)) {
    const schema = schemas[schemaName];
    if (!schema?.properties) continue;

    schema.oneOf = fields.map((field) => ({
      type: "object",
      required: [field],
      properties: {
        [field]: schema.properties[field],
      },
    }));
    delete schema.properties;
    delete schema.type;
  }

  // Apply tuples via prefixItems (OpenAPI 3.1)
  for (const [schemaName, fields] of Object.entries(tupleFields)) {
    const schema = schemas[schemaName];
    if (!schema?.properties) continue;

    for (const [field, count] of Object.entries(fields)) {
      const prop = schema.properties[field];
      if (!prop?.items) continue;

      prop.prefixItems = Array.from({ length: count }, () => ({ ...prop.items }));
      prop.minItems = count;
      prop.maxItems = count;
      delete prop.items;
    }
  }

  return inputSchema;
};
