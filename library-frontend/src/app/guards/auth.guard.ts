import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Functional guards (Angular 15+) are just a function returning true/false -
// true lets navigation proceed, false blocks it. This mirrors what
// SecurityConfig does on the backend (blocking unauthenticated requests to
// protected endpoints), but on the FRONTEND. It's worth understanding this
// is purely a UX convenience - it stops a logged-out user from seeing a
// broken page. The backend's SecurityFilterChain is what actually enforces
// security; a guard alone never protects data, since anyone could call the
// API directly with curl, bypassing Angular entirely.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
