import { Request } from "express";

export type ValidatorFunction<TParams = any, TBody = any, TQuery = any> = (
  request: Request<TParams, any, TBody, TQuery>
) => string | undefined;

export type ValidationOptions<TParams = {}, TBody = {}, TQuery = {}> = {
  required: boolean;
  validator?: ValidatorFunction<TParams, TBody, TQuery>;
};

export type ValidateRequestSchema<TParams = any, TBody = any, TQuery = any> = {
  body: {
    [key in keyof TBody]: ValidationOptions<TParams, TBody, TQuery>;
  };
  query: {
    [key in keyof TQuery]: ValidationOptions<TParams, TBody, TQuery>;
  };
  files: {
    [key: string]: ValidationOptions<TParams, TBody, TQuery>;
  };
  params: {
    [key in keyof TParams]: ValidationOptions<TParams, TBody, TQuery>;
  };
};

export type ValidateRequestOptions<TQuery, TBody, TParams, TFiles> = {
  errorCode: number;
  formatErrorPayload: (
    fields: FormatErrorPayloadArgs<TQuery, TBody, TParams, TFiles>
  ) => any;
  cleanupMulter: boolean;
};

export type ErrorPayload = {
  error: string;
  fields: { [key: string]: string };
};

export type FormatErrorPayloadArgs<TQuery, TBody, TParams, TFiles> = {
  query: { [key in keyof TQuery]: string } | null;
  body: { [key in keyof TBody]: string } | null;
  files: { [key in keyof TFiles]: string } | null;
  params: { [key in keyof TParams]: string } | null;
};
