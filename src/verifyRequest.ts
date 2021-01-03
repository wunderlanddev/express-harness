import { Request } from "express";
import { ValidateRequestSchema, ValidationOptions } from "./types";

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

  //   const payload = request[whereToLook];

  if (whereToLook === "files") {
    return {} as {
      [key in keyof TResult]: string;
    };
  }

  const payload = request[whereToLook] as { [key: string]: any };

  const missingFields = requiredFields.filter(
    (field) => !payload[String(field)]
  );

  let requiredFieldsResult: null | { [key: string]: string } = null;

  if (missingFields.length) {
    requiredFieldsResult = missingFields.reduce(
      (acl, curr) => ({
        ...acl,
        [curr]: `${curr} is required`,
      }),
      {}
    );
  }

  // Execute Custom Validators
  const fieldsWithValidators = Object.keys(schema).filter(
    (field) => schema[field].validator
  );

  let customValidationResults: null | { [key: string]: string } = null;

  if (fieldsWithValidators.length) {
    customValidationResults = fieldsWithValidators.reduce((acl, curr) => {
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
  }

  if (!customValidationResults && !requiredFieldsResult) {
    return null;
  }

  return { ...customValidationResults, ...requiredFieldsResult } as {
    [key in keyof TResult]: string;
  };
};
