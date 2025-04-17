import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, take, tap } from 'rxjs/operators';

/**
 * authGuard – allows access to routes only if the user is authenticated.
 * If not logged in, the user is redirected to the login page.
 *
 * Usage example in routes:
 * { path: 'dashboard', canActivate: [authGuard], ... }
 */
export const authGuard: CanActivateFn = () => {
  const afAuth = inject(AngularFireAuth);
  const router = inject(Router);

  return afAuth.authState.pipe(
    take(1),  // Only take the first auth state value
    map((user) => !!user), // Convert user object to boolean
    tap((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigate(['/login']); // Redirect to login if not authenticated
      }
    })
  );
};

/**
 * reverseAuthGuard – allows access only if the user is NOT authenticated.
 * Useful for login, registration, or password reset routes.
 * If already logged in, the user is redirected to the main page.
 *
 * Usage example in routes:
 * { path: 'login', canActivate: [reverseAuthGuard], ... }
 */
export const reverseAuthGuard: CanActivateFn = () => {
  const afAuth = inject(AngularFireAuth);
  const router = inject(Router);

  return afAuth.authState.pipe(
    take(1), // Only take the first auth state value
    map((user) => !user), // Only allow if not authenticated
    tap((isNotAuthenticated) => {
      if (!isNotAuthenticated) {
        router.navigate(['/main']); // Redirect to main if already logged in
      }
    })
  );
};

