import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth';
import { API_BASE } from '../api-config';

/** Attaches the admin JWT to API calls and logs out when the server rejects it. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  if (!token || !req.url.startsWith(API_BASE)) {
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
