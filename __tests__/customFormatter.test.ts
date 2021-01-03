import { NextFunction, Request, Response } from "express";
import { validateRequest } from "../src";
import { FormatErrorPayloadArgs } from "../src/types";

describe("Basic Required Fields Test", () => {
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();
  let mockFile: Partial<Express.Multer.File> = {};

  let customFormatter = (
    fields: FormatErrorPayloadArgs<any, any, any, any>
  ) => {
    return {
      message: "Following fields failed",
      customKey: fields,
    };
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
    const mw = validateRequest(
      { query: { name: { required: true } } },
      { formatErrorPayload: customFormatter }
    );
    mw(
      { query: {} } as Request<any, any, { name: string }, any>,
      mockResponse as any,
      nextFunction
    );
    expect(mockResponse.json).toBeCalledWith({
      message: "Following fields failed",
      customKey: {
        query: {
          name: "name is required",
        },
        body: null,
        files: null,
        params: null,
      },
    });
  });

  // Body
  it("it should not call the next() middleware [body]", () => {
    const mw = validateRequest(
      { body: { name: { required: true } } },
      { formatErrorPayload: customFormatter }
    );
    mw(
      { body: {} } as Request<any, any, { name: string }, any>,
      mockResponse as any,
      nextFunction
    );
    expect(mockResponse.json).toBeCalledWith({
      message: "Following fields failed",
      customKey: {
        body: {
          name: "name is required",
        },
        query: null,
        files: null,
        params: null,
      },
    });
  });

  // Files
  it("it should not call the next() middleware [files]", () => {
    const mw = validateRequest(
      { files: { iconImage: { required: true } } },
      { formatErrorPayload: customFormatter }
    );
    mw({ files: {} } as any, mockResponse as Response, nextFunction);
    expect(mockResponse.json).toBeCalledWith({
      message: "Following fields failed",
      customKey: {
        files: {
          iconImage: "iconImage is required",
        },
        query: null,
        body: null,
        params: null,
      },
    });
  });

  // File
  it("it should not call the next() middleware [file]", () => {
    const mw = validateRequest(
      { files: { iconImage: { required: true } } },
      { formatErrorPayload: customFormatter }
    );
    mw({ file: {} } as any, mockResponse as Response, nextFunction);
    expect(mockResponse.json).toBeCalledWith({
      message: "Following fields failed",
      customKey: {
        files: {
          iconImage: "iconImage is required",
        },
        query: null,
        body: null,
        params: null,
      },
    });
  });

  // Params
  it("it should not call the next() middleware [params]", () => {
    const mw = validateRequest(
      { params: { name: { required: true } } },
      { formatErrorPayload: customFormatter }
    );
    mw(
      { params: {} } as Request<{ name: string }, any, any, any>,
      mockResponse as any,
      nextFunction
    );
    expect(mockResponse.json).toBeCalledWith({
      message: "Following fields failed",
      customKey: {
        params: {
          name: "name is required",
        },
        query: null,
        body: null,
        files: null,
      },
    });
  });
});
