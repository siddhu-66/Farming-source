import { Request, Response, NextFunction } from 'express';

/**
 * Placeholder for CSRF Protection.
 * Currently, we are using stateless JWT Bearer tokens, so CSRF is inherently mitigated 
 * because the browser does not automatically send Bearer tokens with cross-site requests.
 * 
 * If we move to HttpOnly Cookies in the future, we will activate the full CSRF protection here 
 * (e.g., using csurf package).
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Pass-through for now
  next();
};
