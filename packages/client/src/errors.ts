import { type ResultAsync, errAsync } from '@lens-social/types';
import type { CombinedError } from '@urql/core';

/**
 * @internal
 */
export enum GraphQLErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_USER_INPUT = 'BAD_USER_INPUT',
  BAD_REQUEST = 'BAD_REQUEST',
}
/**
 * @internal
 */
export function hasExtensionCode(error: CombinedError, code: GraphQLErrorCode): boolean {
  return error.graphQLErrors.some((gqlError) => {
    return gqlError.extensions?.code === code;
  });
}

class ResultAwareError extends Error {
  asResultAsync(): ResultAsync<never, typeof this> {
    return errAsync(this);
  }
}

/**
 * Error indicating a user is not authenticated.
 */
export class UnauthenticatedError extends ResultAwareError {
  name = 'UnauthenticatedError' as const;

  static from(error: CombinedError): UnauthenticatedError {
    return new UnauthenticatedError(error.message, { cause: error });
  }
}

/**
 * Error indicating an unexpected condition occurred.
 */
export class UnexpectedError extends ResultAwareError {
  name = 'UnexpectedError' as const;

  static from(cause: unknown) {
    const message = UnexpectedError.formatMessage(cause);
    return new UnexpectedError(message, { cause });
  }

  private static formatMessage(cause: unknown): string {
    if (!(cause instanceof Error)) {
      return String(cause);
    }

    const messages: string[] = [];
    let currentError: unknown = cause;

    while (currentError instanceof Error) {
      messages.push(currentError.message);
      currentError = currentError.cause;
    }

    return messages.join(' due to ');
  }
}

export class AuthenticationError extends ResultAwareError {
  name = 'AuthenticationError' as const;

  static from(message: string) {
    return new AuthenticationError(message);
  }
}

/**
 * Error indicating an error occurred while signing.
 */
export class SigningError extends ResultAwareError {
  name = 'SigningError' as const;

  static from(cause: unknown) {
    return new SigningError('An error occurred while signing', { cause });
  }
}
