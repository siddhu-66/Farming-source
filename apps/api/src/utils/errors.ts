export class BaseError extends Error {
  statusCode: number;
  errors: any[];

  constructor(name: string, statusCode: number, message: string, errors: any[] = []) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string = 'Validation failed', errors: any[] = []) {
    super('ValidationError', 422, message, errors);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string = 'Authentication failed') {
    super('AuthenticationError', 401, message);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string = 'Forbidden access') {
    super('AuthorizationError', 403, message);
  }
}

export class DatabaseError extends BaseError {
  constructor(message: string = 'Database operation failed', errors: any[] = []) {
    super('DatabaseError', 500, message, errors);
  }
}

export class ExternalAPIError extends BaseError {
  constructor(message: string = 'External API call failed') {
    super('ExternalAPIError', 502, message);
  }
}

export class FileUploadError extends BaseError {
  constructor(message: string = 'File upload failed') {
    super('FileUploadError', 400, message);
  }
}

export class BusinessRuleError extends BaseError {
  constructor(message: string) {
    super('BusinessRuleError', 409, message);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string = 'Resource not found') {
    super('NotFoundError', 404, message);
  }
}

export class UnknownError extends BaseError {
  constructor(message: string = 'An unknown error occurred') {
    super('UnknownError', 500, message);
  }
}
