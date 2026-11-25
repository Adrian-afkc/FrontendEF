import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSv } from './auth-sv';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthSv);
  const router = inject(Router);

  if (auth.autenticado()) {
    return true;
  }

  if (auth.token() && auth.tokenExpirado()) {
    auth.cerrarSesion();
  }

  return router.createUrlTree(['/login']);
};
