import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Functional interceptors (Angular 15+) are just a function, not a class -
// simpler than the older HttpInterceptor class-based API. This one runs on
// EVERY outgoing HttpClient request in the app, so instead of manually
// adding an Authorization header in BookService/AuthorService, we do it
// here, once, centrally.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Don't attach a token to the auth endpoints themselves - you don't have
  // one yet when logging in, and it would be meaningless on /register.
  if (token && !req.url.includes('/api/auth/')) {
    const cloned = req.clone({
      // HttpRequest objects are immutable - you can't mutate req.headers
      // directly, you clone the request with the header added instead.
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(cloned);
  }

  return next(req);
};
