import { NextFunction, Request, Response } from "express";
import { validateRequest } from "../src";

describe("Basic Required Fields Test", () => {
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();
  let mockFile: Partial<Express.Multer.File> = {};

  beforeEach(() => {
    nextFunction = jest.fn();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // Query
  it("it should not call the next() middleware [query]", () => {
    const mw = validateRequest({ query: { name: { required: true } } });
    mw(
      { query: {} } as Request<any, any, { name: string }, any>,
      mockResponse as any,
      nextFunction
    );
    expect(mockResponse.json).toBeCalledWith({
      error: "Validation for the following fields are failed",
      fields: {
        query: {
          name: "name is required",
        },
      },
    });
  });

  it("it should call the next() middleware [query]", () => {
    const mw = validateRequest({ query: { name: { required: true } } });
    mw(
      { query: { name: "John" } } as Request<any, any, { name: string }, any>,
      mockResponse as any,
      nextFunction
    );
    expect(nextFunction).toBeCalled();
  });

  // Body
  it("it should not call the next() middleware [body]", () => {
    const mw = validateRequest({ body: { name: { required: true } } });
    mw(
      { body: {} } as Request<any, any, { name: string }, any>,
      mockResponse as any,
      nextFunction
    );
    expect(mockResponse.json).toBeCalledWith({
      error: "Validation for the following fields are failed",
      fields: {
        body: {
          name: "name is required",
        },
      },
    });
  });

  it("it should call the next() middleware [body]", () => {
    const mw = validateRequest({ body: { name: { required: true } } });
    mw(
      { body: { name: "asd" } } as Request<any, any, { name: string }, any>,
      mockResponse as any,
      nextFunction
    );
    expect(nextFunction).toBeCalled();
  });

  // Files
  it("it should not call the next() middleware [files]", () => {
    const mw = validateRequest({ files: { iconImage: { required: true } } });
    mw({ files: {} } as any, mockResponse as Response, nextFunction);
    expect(mockResponse.json).toBeCalledWith({
      error: "Validation for the following fields are failed",
      fields: {
        files: {
          iconImage: "iconImage is required",
        },
      },
    });
  });

  it("it should call the next() middleware [files]", () => {
    const mw = validateRequest({ files: { iconImage: { required: true } } });
    mw(
      { files: { iconImage: [{ path: "" }] } } as any,
      mockResponse as any,
      nextFunction
    );
    expect(nextFunction).toBeCalled();
  });

  // File
  it("it should not call the next() middleware [file]", () => {
    const mw = validateRequest({ files: { iconImage: { required: true } } });
    mw({ file: {} } as any, mockResponse as Response, nextFunction);
    expect(mockResponse.json).toBeCalledWith({
      error: "Validation for the following fields are failed",
      fields: {
        files: {
          iconImage: "iconImage is required",
        },
      },
    });
  });

  it("it should call the next() middleware [files]", () => {
    const mw = validateRequest({ files: { iconImage: { required: true } } });
    mw(
      { file: { iconImage: [{ path: "" }] } } as any,
      mockResponse as any,
      nextFunction
    );
    expect(nextFunction).toBeCalled();
  });

  // Params
  it("it should not call the next() middleware [params]", () => {
    const mw = validateRequest({ params: { name: { required: true } } });
    mw(
      { params: {} } as Request<{ name: string }, any, any, any>,
      mockResponse as any,
      nextFunction
    );
    expect(mockResponse.json).toBeCalledWith({
      error: "Validation for the following fields are failed",
      fields: {
        params: {
          name: "name is required",
        },
      },
    });
  });

  it("it should call the next() middleware [params]", () => {
    const mw = validateRequest({ params: { name: { required: true } } });
    mw(
      { params: { name: "asd" } } as Request<{ name: string }, any, any, any>,
      mockResponse as any,
      nextFunction
    );
    expect(nextFunction).toBeCalled();
  });
});
