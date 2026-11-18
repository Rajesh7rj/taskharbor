import "server-only";

import {
  AuthenticationError,
  AuthorizationError,
} from "@/features/auth/server/errors";

export function apiValidationError(
  details: unknown,
  message = "Invalid request data.",
) {
  return Response.json(
    { error: { code: "VALIDATION_ERROR", message, details } },
    { status: 400 },
  );
}

export function apiNotFound(message: string) {
  return Response.json(
    { error: { code: "NOT_FOUND", message } },
    { status: 404 },
  );
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof AuthenticationError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: 401 },
    );
  }

  if (error instanceof AuthorizationError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: 403 },
    );
  }

  console.error("API request failed", error);

  return Response.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "The request could not be completed.",
      },
    },
    { status: 500 },
  );
}
