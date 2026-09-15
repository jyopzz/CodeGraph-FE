import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {

  /*
   * CodeGraph Agent uses Authorization: Bearer <sessionToken>
   * and does not use browser cookies.
   *
   * Do not enable credentials mode for Agent requests.
   */
  if (req.url.startsWith(environment.agentUrl)) {
    return next(req);
  }

  /*
   * Backend application APIs use cookie authentication.
   */
  return next(
    req.clone({
      withCredentials: true,
    })
  );
};