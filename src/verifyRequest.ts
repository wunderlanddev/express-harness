import { Request } from "express";
import { ValidateRequestSchema, ValidationOptions } from "./types";

const isEmpty = (obj: { [key: string]: any }): boolean => {
  for (let key in obj) {
    return false;
  }
  return true;
};

export const verifyRequest = <
  TQuery = { [key: string]: any },
  TBody = { [key: string]: any },
  TParams = { [key: string]: string },
  TResult = {}
>(
  schema:
    | { [key: string]: ValidationOptions<TParams, TBody, TQuery> }
    | undefined,
  whereToLook: keyof ValidateRequestSchema,
  request: Request<TParams, any, TBody, TQuery>
): { [key in keyof TResult]: string } | null => {
  if (!schema) {
    return null;
  }

  // Required fields gets high priority
  const requiredFields = Object.keys(schema).filter(
    (field) => schema[field].required
  );

  let payload = request[whereToLook] as { [key: string]: any };

  if (whereToLook === "files") {
    payload = { ...payload, ...request.file };
  }

  const missingFields = requiredFields.filter(
    (field) => !payload[String(field)]
  );

  const requiredFieldsResult = missingFields.reduce(
    (acl, curr) => ({
      ...acl,
      [curr]: `${curr} is required`,
    }),
    {}
  );

  // Execute Custom Validators
  const fieldsWithValidators = Object.keys(schema).filter(
    (field) => schema[field].validator
  );

  const customValidationResults = fieldsWithValidators.reduce((acl, curr) => {
    const { validator } = schema[curr];
    if (!validator) {
      return acl;
    }
    const isValid = validator(request);

    if (!isValid) {
      return acl;
    }

    return { ...acl, [curr]: isValid };
  }, {});

  if (isEmpty(customValidationResults) && isEmpty(requiredFieldsResult)) {
    return null;
  }

  return { ...customValidationResults, ...requiredFieldsResult } as {
    [key in keyof TResult]: string;
  };
};
