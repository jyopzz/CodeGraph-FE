import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkSession().pipe(
    map((response: any) => {
      if (response && response.successful) {
        return true;
      }
      localStorage.removeItem('is_authenticated');
      return router.parseUrl('/login');
    }),
    catchError(() => {
      localStorage.removeItem('is_authenticated');
      return of(router.parseUrl('/login'));
    })
  );
};