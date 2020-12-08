import { RequestHandler } from "express";
import { unlinkSync } from "fs";
import { formatErrorPayload as defaultErrorFormatter } from "./formatErrorPayload";
import { ValidateRequestOptions, ValidateRequestSchema } from "./types";

export const validateRequest = <TParams = any, TBody = any, TQuery = any>(
  schema: ValidateRequestSchema<TParams, TBody, TQuery>,
  options?: ValidateRequestOptions
): RequestHandler<TParams, any, TBody, TQuery> => (request, response, next) => {
  const {
    formatErrorPayload = defaultErrorFormatter,
    errorCode = 400,
    cleanupMulter = true,
  } = options || {};

  const cleanupFiles = () => {
    if (files && request.files) {
      Object.keys(request.files).forEach((file) => {
        const fileList = (request.files as {
          [key: string]: Express.Multer.File[];
        })[file];
        fileList.forEach((item) => {
          unlinkSync(item.path);
        });
      });
    }
  };

  // No rules provided
  if (!Object.keys(schema).length) {
    return next();
  }

  const { query, body, files, params } = schema;

  // Check for Query Validations
  if (query) {
    // Required fields gets high priority
    const requiredFields = (Object.keys(query) as Array<keyof TQuery>).filter(
      (field) => query[field].required
    );

    const missingFields = requiredFields.filter(
      (field) => !request.query[field]
    );

    // Required fields are missing
    if (missingFields.length) {
      // Cleanup multer [TODO]
      if (cleanupMulter) {
        cleanupFiles();
      }

      const queryRequiredFields = missingFields.reduce(
        (acl, curr) => ({
          ...acl,
          [curr]: `${curr} is required`,
        }),
        {}
      );

      Object.assign(queryErrors, queryRequiredFields);
    }

    // Execute Custom Validators
    const fieldsWithValidators = (Object.keys(
      query
    ) as (keyof TQuery)[]).filter((field) => query[field].validator);

    const queryValidationResults = fieldsWithValidators.reduce((acl, curr) => {
      const { validator } = query[curr];
      if (!validator) {
        return acl;
      }
      const isValid = validator(request);

      if (!isValid) {
        return acl;
      }

      return { ...acl, [curr]: isValid };
    }, {});

    Object.assign(queryErrors, queryValidationResults);

    // if (Object.keys(validationResults).length) {
    //   return response
    //     .status(400)
    //     .json(defaultErrorFormatter(validationResults));
    // }
  }

  let bodyErrors = {};
  // Check for Body
  if (body) {
    // Required first
    const requiredFields = (Object.keys(body) as (keyof TBody)[]).filter(
      (field) => body[field].required
    );

    const missingFields = requiredFields.filter(
      (field) => !request.body[field]
    );

    if (missingFields.length) {
      if (cleanupMulter) {
        cleanupFiles();
      }
      const bodyRequiredFields = missingFields.reduce(
        (acl, curr) => ({
          ...acl,
          [curr]: `${curr} is required`,
        }),
        {}
      );
      Object.assign(bodyErrors, bodyRequiredFields);
    }

    // Custom Validators
    const fieldsWithValidators = (Object.keys(body) as (keyof TBody)[]).filter(
      (field) => body[field].validator
    );

    const bodyValidationResults = fieldsWithValidators.reduce((acl, curr) => {
      const { validator } = body[curr];
      if (!validator) {
        return acl;
      }
      const isValid = validator(request);

      if (!isValid) {
        return acl;
      }

      return { ...acl, [curr]: isValid };
    }, {});

    Object.assign(queryErrors, bodyValidationResults);
  }

  let fileErrors = {};
  // Check for Files
  if (files) {
    // Required fields first
    const requiredFields = Object.keys(files).filter(
      (field) => files[field].required
    );

    const missingFields = requiredFields.filter(
      (field) =>
        !(request.files as {
          [fieldname: string]: Express.Multer.File[];
        })[field]
    );

    if (missingFields.length) {
      if (cleanupMulter) {
        cleanupFiles();
      }
      const filesRequiredFields = missingFields.reduce(
        (acl, curr) => ({
          ...acl,
          [curr]: `${curr} is required`,
        }),
        {}
      );
      Object.assign(fileErrors, filesRequiredFields);
    }
  }

  let paramErros = {};
  // Check For Params
  if (params) {
    // Required Fields First
    const requiredFields = (Object.keys(params) as (keyof TParams)[]).filter(
      (field) => params[field].required
    );

    const missingFields = requiredFields.filter(
      (field) => !request.params[field]
    );

    if (missingFields.length) {
      const paramsRequiredFields = missingFields.reduce(
        (acl, curr) => ({
          ...acl,
          [curr]: `${curr} is required`,
        }),
        {}
      );
      Object.assign(paramErros, paramsRequiredFields);
    }

    // Custom Validators
    const fieldsWithValidators = (Object.keys(
      params
    ) as (keyof TParams)[]).filter((field) => params[field].validator);

    const bodyValidationResults = fieldsWithValidators.reduce((acl, curr) => {
      const { validator } = params[curr];
      if (!validator) {
        return acl;
      }
      const isValid = validator(request);

      if (!isValid) {
        return acl;
      }

      return { ...acl, [curr]: isValid };
    }, {});

    Object.assign(paramErros, bodyValidationResults);
  }
  return next();
};
