import { ErrorPayload, FormatErrorPayloadArgs } from "./types";

export const formatErrorPayload = <
  TQuery = {},
  TBody = {},
  TParams = {},
  TFiles = {}
>(
  fields: FormatErrorPayloadArgs<TQuery, TBody, TParams, TFiles>
): ErrorPayload | { [key: string]: any } | any => {
  const erroraneousFields = (Object.keys(
    fields
  ) as (keyof FormatErrorPayloadArgs<TQuery, TBody, TParams, TFiles>)[])
    .filter((field) => fields[field])
    .reduce((acl, curr) => ({ ...acl, [curr]: fields[curr] }), {});
  const errorResponse: ErrorPayload = {
    error: "Validation for the following fields are failed",
    fields: erroraneousFields,
  };
  return errorResponse;
};
