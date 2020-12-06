# express-validate-request

A light-weight no-dependencies Express.JS middleware that helps with the validation of requests (in case of form submissions etc).

In general,

- We provide a validation schema (_where to look_, _is it required?_ and _what to expect_)
- This middleware will then validate the request with the schema, and if it fails, it'll return the request with `400`.

# Installation

```bash
npm i @wunderland/express-validate-request
```

or

```bash
yarn add @wunderland/express-validate-request
```

# Usage

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

## Validation Schema Type

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
};
```

## Validator Type:

```typescript
type ValidatorFunction = (
  body: { [key: string]: any },
  query: { [key: string]: any }
) => string | undefined;
```  

## Custom Validation  
You can specify a custom validator method for each field in the schema. Refer the validation type above.  

If this validator function returns a string, it'll be treated as an error, and the returned string will be used as an error message. If it's `undefined`, then it'll be considered as no-error.  


