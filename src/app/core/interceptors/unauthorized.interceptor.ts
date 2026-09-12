import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Clear local UI state since cookies are invalid or missing
        localStorage.removeItem('is_authenticated');
        // Redirect to login
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};