export type ErrorPayload = {
  error: string;
  fields: { [key: string]: string };
};
export const formatErrorPayload = (fields: {
  [key: string]: any;
}): ErrorPayload | { [key: string]: any } => {
  let errorResponse: ErrorPayload = {
    error: "Validation for the following fields are failed",
    fields,
  };
  return errorResponse;
};
