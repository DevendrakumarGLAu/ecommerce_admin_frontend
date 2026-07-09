import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { TokenResponse } from '../models/auth.model';
import { ApiService } from '../services/api.service';
import { TokenService } from '../services/token.service';

const AUTH_EXEMPT_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password'
];

// Module-level (not injectable) state: functional interceptors are plain
// functions invoked per-request, so cross-request refresh coordination has
// to live outside any single invocation.
let isRefreshing = false;
const refreshedAccessToken$ = new BehaviorSubject<string | null>(null);

/**
 * Attaches the JWT access token to outgoing requests and transparently
 * refreshes it on a 401, retrying the original request once. Concurrent
 * requests that 401 while a refresh is already in flight wait for that
 * single refresh to finish instead of each triggering their own.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const apiService = inject(ApiService);
  const router = inject(Router);

  const isExempt = AUTH_EXEMPT_PATHS.some((path) => req.url.includes(path));
  const accessToken = tokenService.accessToken();

  const authReq = !isExempt && accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;
      if (!isUnauthorized || isExempt) {
        return throwError(() => error);
      }

      if (!tokenService.hasValidRefreshToken()) {
        tokenService.clear();
        void router.navigate(['/auth/login']);
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshedAccessToken$.next(null);

        return apiService
          .post<TokenResponse>('/auth/refresh', { refresh_token: tokenService.refreshToken() })
          .pipe(
            switchMap((tokens) => {
              isRefreshing = false;
              tokenService.setTokens(tokens.access_token, tokens.refresh_token);
              refreshedAccessToken$.next(tokens.access_token);
              return next(req.clone({ setHeaders: { Authorization: `Bearer ${tokens.access_token}` } }));
            }),
            catchError((refreshError: unknown) => {
              isRefreshing = false;
              tokenService.clear();
              void router.navigate(['/auth/login']);
              return throwError(() => refreshError);
            })
          );
      }

      return refreshedAccessToken$.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((token) => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
      );
    })
  );
};
