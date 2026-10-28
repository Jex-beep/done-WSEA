import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth';

const API_HOST = 'mjqualitycars-backend-api.onrender.com';

/** Attaches the admin JWT to API calls and logs out when the server rejects it. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  if (!token || !req.url.includes(API_HOST)) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    tap({
      error: (err) => {
        if (err.status === 401) auth.logout();
      }
    })
  );
};
