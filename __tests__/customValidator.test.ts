import { NextFunction, Request, Response } from "express";
import { validateRequest } from "../src";

describe("Custom Validators Test", () => {
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();
  let mockFile: Partial<Express.Multer.File> = {};

  let isNumberValidator = (whereToLook: keyof Request, field: string) => (
    request: Request<any, any, any, any>
  ): string | undefined => {
    const payload = request[whereToLook][field];
    if (!Number.isInteger(parseInt(payload))) {
      return `${field} is not a number`;
    }
    return undefined;
  };

  beforeEach(() => {
    nextFunction = jest.fn();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // Query
  it("it should not call the next() middleware [query]", () => {
    const mw = validateRequest({
      query: {
        age: { required: true, validator: isNumberValidator("query", "age") },
      },
    });
    mw(
      { query: { age: "asd" } } as Request<any, any, { age: string }, any>,
      mockResponse as any,
      nextFunction
    );
    expect(mockResponse.json).toBeCalledWith({
      error: "Validation for the following fields are failed",
      fields: {
        query: {
          age: "age is not a number",
        },
      },
    });
  });

  it("it should call the next() middleware [query]", () => {
    const mw = validateRequest({
      query: {
        age: { required: true, validator: isNumberValidator("query", "age") },
      },
    });
    mw(
      { query: { age: "12" } } as Request<any, any, { age: string }, any>,
      mockResponse as any,
      nextFunction
    );
    expect(nextFunction).toBeCalled();
  });

  // Body
  it("it should not call the next() middleware [body]", () => {
    const mw = validateRequest({
      body: {
        age: { required: true, validator: isNumberValidator("body", "age") },
      },
    });
    mw(
      { body: { age: "asd" } } as Request<any, any, { age: string }, any>,
      mockResponse as any,
      nextFunction
    );
    expect(mockResponse.json).toBeCalledWith({
      error: "Validation for the following fields are failed",
      fields: {
        body: {
          age: "age is not a number",
        },
      },
    });
  });

  it("it should call the next() middleware [body]", () => {
    const mw = validateRequest({
      body: {
        age: { required: true, validator: isNumberValidator("body", "age") },
      },
    });
    mw(
      { body: { age: "12" } } as Request<any, any, { age: string }, any>,
      mockResponse as any,
      nextFunction
    );
    expect(nextFunction).toBeCalled();
  });

  // Params
  it("it should not call the next() middleware [params]", () => {
    const mw = validateRequest({
      params: {
        age: { required: true, validator: isNumberValidator("params", "age") },
      },
    });
    mw(
      { params: { age: "asd" } } as Request<{ age: string }, any, any, any>,
      mockResponse as any,
      nextFunction
    );
    expect(mockResponse.json).toBeCalledWith({
      error: "Validation for the following fields are failed",
      fields: {
        params: {
          age: "age is not a number",
        },
      },
    });
  });

  it("it should call the next() middleware [params]", () => {
    const mw = validateRequest({
      params: {
        age: { required: true, validator: isNumberValidator("params", "age") },
      },
    });
    mw(
      { params: { age: "12" } } as Request<{ age: string }, any, any, any>,
      mockResponse as any,
      nextFunction
    );
    expect(nextFunction).toBeCalled();
  });
});
