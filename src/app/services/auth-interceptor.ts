import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE } from './api';
import { AuthSv } from './auth-sv';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthSv);
  const router = inject(Router);
  const token = auth.token();
  const esApi = req.url.startsWith(API_BASE);
  const esLogin = req.url.includes('/auth/login');

  const peticion =
    token && esApi && !esLogin
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(peticion).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && esApi && !esLogin) {
        auth.cerrarSesion();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
