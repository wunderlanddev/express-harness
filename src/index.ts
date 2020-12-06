import { RequestHandler } from "express";
import { unlinkSync } from "fs";

type ValidatorFunction = (
  body: { [key: string]: any },
  query: { [key: string]: any }
) => string | undefined;

export type ValidateRequestSchema = {
  body?: {
    [key: string]: {
      required: boolean;
      validator?: ValidatorFunction;
    };
  };
  query?: {
    [key: string]: {
      required: boolean;
      validator?: ValidatorFunction;
    };
  };
  files?: {
    [key: string]: {
      required: boolean;
    };
  };
};

export const validateRequest = (
  schema: ValidateRequestSchema
): RequestHandler => (request, response, next) => {
  const { query, body, files } = schema;

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
    const requiredFields = Object.keys(query).filter(
      (field) => query[field].required
    );
    const missingFields = requiredFields.filter(
      (field) => !request.query[field]
    );

    if (missingFields.length) {
      cleanupFiles();
      return response.status(400).json({
        error: "Required fields cannot be empty",
        fields: missingFields.join(","),
      });
    }

    const validationResults = Object.keys(query)
      .map((field) => {
        const { validator } = query[field];
        if (validator) {
          if (validator(request.body, request.query)) {
            return { [field]: validator(request.body, request.query) };
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

  if (body) {
    const requiredFields = Object.keys(body).filter(
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

    const validationResults = Object.keys(body)
      .map((field) => {
        const { validator } = body[field];
        if (validator) {
          if (validator(request.body, request.query)) {
            return { [field]: validator(request.body, request.query) };
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
  return next();
};
