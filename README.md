# express-validate-request

A fully typed, light-weight, unopinionated and no-dependencies Express.JS middleware that helps with the validation of requests.

In general, as a developer,

- You provide a validation schema that has the following attributes:

  - Where to look (_query, body etc.._)
  - What to look (_field names_)
  - Whether it's required or not
  - Defines your own validation logic against this field.

- This middleware will then validate the request with the schema, and if it fails, it'll return the request with `400` (_by default_).

# Installation

```bash
npm i @wunderland/express-validate-request
```

or

```bash
yarn add @wunderland/express-validate-request
```

# Examples

## Basic Example

```javascript
import { validateRequest } from "@wunderland/express-validate-request";
import express from "express";

const app = express();

app.post(
  "/",
  validateRequest({ body: { user_id: { required: true } } }),
  (request, response) => {
    return response.status(200).json({ user_id: request.body.user_id });
  }
);
```

> Response

```json
{
  "error": "Validation for the following fields are failed",
  "fields": {
    "body": {
      "user_id": "user_id is required"
    }
  }
}
```

## Custom Validation

```javascript
import { validateRequest } from "@wunderland/express-validate-request";
import express from "express";

const app = express();

app.post(
  "/",
  validateRequest({
    body: {
      user_id: {
        required: true,
      },
      age: {
        required: false,
        validator: (request) => {
          const {
            body: { age = 5 },
          } = request;
          if (Number(age) < 10) {
            return `You must be at least 10 years old`;
          }
          return undefined;
        },
      },
    },
  }),
  (request, response) => {
    return response.status(200).json({ user_id: request.body.user_id });
  }
);
```

> Response

```json
{
  "error": "Validation for the following fields are failed",
  "fields": {
    "body": {
      "age": "You must be at least 10 years old",
      "user_id": "user_id is required"
    }
  }
}
```

# API

`express-validate-request` exports a named function:

## `validateRequest(schema, [options])`

This `validateRequest` method will validate the express `request` against the specified `schema` and will return a `400` with a default error message (which is configurable through `options`).

### `schema`

The schema is a normal `Object` that has the following type definition:

#### Validation Schema Type

```typescript
type ValidateRequestSchema = {
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
  params?: {
    [key: string]: {
      required: boolean;
      validator?: ValidatorFunction;
    };
  };
};
```

### Custom Validation ( `ValidatorFunction` )

You can specify your own validation logic against the fields using this `validator` method.

When specified, this will be invoked with the following argument signature:

```typescript
type ValidatorFunction = (request: Request) => string | undefined;
```

If this validator function returns a string, it'll be treated as an error, and the returned string will be used as the error message. If it's `undefined`, then it'll be considered as no-error.

### `options` `[object]`

Through options, you can configure the _HTTP Error Code_ and format the error response according to your needs. It also does the cleaning of saved files (through `Multer`) in case any of the validation fails (_fail fast_)

```typescript
type ValidateRequestOptions = {
  errorCode: number;
  formatErrorPayload: (fields: Fields) => any;
  cleanupMulter: boolean;
};
```

#### `cleanupMulter`: `[boolean]` (_defaults to `true`_)

Delete the saved files (by `multer`) in case any validation fails.

#### `errorCode` `[number]` (_defaults to `400`_)

The HTTP status code to return on error. You can set any number (although 400 is the preferred).

#### `formatErrorPayload` `[function]` (_defaults to a built-in formatter_)

This is a helper function that'll let you to customize the error response before sending it to the client.

When provided, this function will get invoked with an `object` as its param which has the following signature:

```typescript
type Fields = {
  body: { [key: string]: string | undefined };
  query: { [key: string]: string | undefined };
  params: { [key: string]: string | undefined };
  files: { [key: string]: string | undefined };
};
```

# Contribution

There's a pretty high-chance where we might've missed many issues. If you find one, please feel free to fork and submit a patch

# License

This library is licensed under MIT
