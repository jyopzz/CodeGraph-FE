import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AgentAuthService } from '../services/agent-auth.service';

export const agentInterceptor: HttpInterceptorFn = (req, next) => {

  // Only process CodeGraph Agent requests.
  if (!req.url.startsWith(environment.agentUrl)) {
    return next(req);
  }

  const agentAuthService = inject(AgentAuthService);

  const sessionToken =
    agentAuthService.getSessionToken();

  // Authentication endpoints do not require
  // an Agent session token.
  if (
    req.url.endsWith('/auth/status') ||
    req.url.endsWith('/auth/pair') ||
    req.url.endsWith('/auth/verify')
  ) {
    return next(req);
  }

  // No Agent session yet.
  if (!sessionToken) {
    return next(req);
  }

  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  return next(authenticatedRequest);
};