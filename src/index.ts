import { RequestHandler } from "express";
import { existsSync, unlinkSync } from "fs";
import { formatErrorPayload as defaultErrorFormatter } from "./formatErrorPayload";
import { ValidateRequestOptions, ValidateRequestSchema } from "./types";
import { verifyRequest } from "./verifyRequest";

export const validateRequest = <TParams = any, TBody = any, TQuery = any>(
  schema: Partial<ValidateRequestSchema<TParams, TBody, TQuery>>,
  options?: Partial<ValidateRequestOptions<TQuery, TBody, TParams, {}>>
): RequestHandler<TParams, any, TBody, TQuery> => (request, response, next) => {
  const {
    formatErrorPayload = defaultErrorFormatter,
    errorCode = 400,
    cleanupMulter = true,
  } = options || {};

  if (!Object.keys(schema).length) {
    return next();
  }

  const { query, body, files, params } = schema;
  const cleanupFiles = () => {
    if (files && (request.files || request.file)) {
      Object.keys({ ...request.files, ...request.file }).forEach((file) => {
        const fileList = (request.files as {
          [key: string]: Express.Multer.File[];
        })[file];
        fileList.forEach((item) => {
          if (existsSync(item.path)) {
            unlinkSync(item.path);
          }
        });
      });
    }
  };

  // No rules provided

  const queryErrors = verifyRequest<TQuery, TBody, TParams, TQuery>(
    query,
    "query",
    request
  );
  const paramsErrors = verifyRequest<TQuery, TBody, TParams, TParams>(
    params,
    "params",
    request
  );
  const bodyErrors = verifyRequest<TQuery, TBody, TParams, TBody>(
    body,
    "body",
    request
  );
  const fileErrors = verifyRequest<TQuery, TBody, TParams, {}>(
    files,
    "files",
    request
  );

  const hasErrors = Boolean(
    queryErrors || paramsErrors || bodyErrors || fileErrors
  );

  if (hasErrors) {
    if (cleanupMulter) {
      cleanupFiles();
    }
    return response.status(errorCode).json(
      formatErrorPayload({
        query: queryErrors,
        body: bodyErrors,
        params: paramsErrors,
        files: fileErrors,
      })
    );
  }

  return next();
};
