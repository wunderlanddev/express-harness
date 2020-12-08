import { Request, RequestHandler } from "express";
import { unlinkSync } from "fs";
import {
  ErrorPayload,
  formatErrorPayload as defaultErrorFormatter,
} from "./formatErrorPayload";

type ValidatorFunction<TParams, TBody, TQuery> = (
  request: Request<TParams, any, TBody, TQuery>
) => string | undefined;

export type ValidateRequestSchema<TParams = any, TBody = any, TQuery = any> = {
  body?: {
    [key in keyof TBody]: {
      required: boolean;
      validator?: ValidatorFunction<TParams, TBody, TQuery>;
      requiredErrorText?: string;
    };
  };
  query?: {
    [key in keyof TQuery]: {
      required: boolean;
      validator?: ValidatorFunction<TParams, TBody, TQuery>;
      requiredErrorText?: string;
    };
  };
  files?: {
    [key: string]: {
      required: boolean;
      requiredErrorText?: string;
    };
  };
  params?: {
    [key in keyof TParams]: {
      required: boolean;
      validator?: ValidatorFunction<TParams, TBody, TQuery>;
    };
  };
};

type ValidateRequestOptions = {
  errorCode: number;
  formatErrorPayload: (fields: {
    [key: string]: any;
  }) => ErrorPayload | { [key: string]: any };
  cleanupMulter: boolean;
};

export const validateRequest = <TParams = any, TBody = any, TQuery = any>(
  schema: ValidateRequestSchema<TParams, TBody, TQuery>,
  options?: ValidateRequestOptions
): RequestHandler<TParams, any, TBody, TQuery> => (request, response, next) => {
  const { query, body, files, params } = schema;
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

  if (!query && !body) {
    return next();
  }

  if (query) {
    const requiredFields = (Object.keys(query) as Array<keyof TQuery>).filter(
      (field) => query[field].required
    );
    const missingFields = requiredFields.filter(
      (field) => !request.query[field]
    );

    if (missingFields.length) {
      cleanupFiles();

      const errorFields = missingFields.reduce(
        (acl, curr) => ({
          ...acl,
          [curr]: query[curr].requiredErrorText || `${curr} is required`,
        }),
        {}
      );

      return response.status(errorCode).json(formatErrorPayload(errorFields));
    }

    const fieldsWithValidators = (Object.keys(
      query
    ) as (keyof TQuery)[]).filter((field) => query[field].validator);

    const validationResults = fieldsWithValidators.reduce((acl, curr) => {
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

    if (Object.keys(validationResults).length) {
      return response
        .status(400)
        .json(defaultErrorFormatter(validationResults));
    }
  }

  if (body) {
    const requiredFields = (Object.keys(body) as (keyof TBody)[]).filter(
      (field) => body[field].required
    );

    const missingFields = requiredFields.filter(
      (field) => !request.body[field]
    );

    if (missingFields.length) {
      cleanupFiles();
      return response.status(400).json({
        error: "Required fields cannot be empty",
        fields: missingFields.join(","),
      });
    }

    const validationResults = (Object.keys(body) as (keyof TBody)[])
      .map((field) => {
        const { validator } = body[field];
        if (validator) {
          if (validator(request)) {
            return { [field]: validator(request) };
          }
          return undefined;
        }
        return undefined;
      })
      .filter((a) => a);
    if (validationResults.length) {
      return response.status(400).json({
        error: "Validation failed for form fields",
        fields: validationResults,
      });
    }
  }

  if (files) {
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
      cleanupFiles();
      return response.status(400).json({
        error: "Required fields cannot be empty",
        fields: missingFields.join(","),
      });
    }
  }

  if (params) {
    const requiredFields = (Object.keys(params) as (keyof TParams)[]).filter(
      (field) => params[field].required
    );

    const missingFields = requiredFields.filter(
      (field) => !request.params[field]
    );

    const validationResults = (Object.keys(params) as (keyof TParams)[])
      .map((field) => {
        const { validator } = params[field];
        if (validator) {
          if (validator(request)) {
            return { [field]: validator(request) };
          }
          return undefined;
        }
        return undefined;
      })
      .filter((a) => a);
    if (validationResults.length) {
      return response.status(400).json({
        error: "Validation failed for the following fields",
        fields: validationResults,
      });
    }
  }
  return next();
};
