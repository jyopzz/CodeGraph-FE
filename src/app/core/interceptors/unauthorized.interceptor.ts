import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { environment } from '../../../environments/environment';

let refreshRequest$: Observable<any> | null = null;

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Agent authentication is handled separately.
      // Never attempt the backend refresh-token flow
      // for CodeGraph Agent requests.
      if (req.url.startsWith(environment.agentUrl)) {
        return throwError(() => error);
      }

      // Never try to refresh the refresh endpoint itself.
      // If refresh fails, the session is no longer recoverable.
      if (req.url.includes('/auth/refresh')) {
        localStorage.removeItem('is_authenticated');
        router.navigate(['/login']);
        return throwError(() => error);
      }

      // One refresh request is shared by all requests that receive 401
      // at the same time. This prevents multiple refresh calls.
      if (!refreshRequest$) {
        refreshRequest$ = authService.refreshToken().pipe(
          shareReplay(1),
          finalize(() => {
            refreshRequest$ = null;
          }),
        );
      }

      return refreshRequest$.pipe(
        switchMap(() => {
          // Refresh succeeded. Retry the original request with the
          // newly issued authentication cookie.
          return next(req.clone({ withCredentials: true }));
        }),
        catchError((refreshError: HttpErrorResponse) => {
          // Refresh token is expired/invalid, so the user must log in again.
          localStorage.removeItem('is_authenticated');
          router.navigate(['/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
