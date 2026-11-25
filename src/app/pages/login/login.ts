import { Component, afterNextRender, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, required } from '@angular/forms/signals';
import { Footer } from '../../layout/footer/footer';
import { Header } from '../../layout/header/header';
import { AuthSv } from '../../services/auth-sv';

interface Credenciales {
  usuario: string;
  contrasena: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField, Header, Footer],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(AuthSv);
  private router = inject(Router);

  mostrarContrasena = signal(false);
  readonly cargando = this.auth.cargando;
  readonly error = this.auth.error;

  private credenciales = signal<Credenciales>({ usuario: '', contrasena: '' });

  formulario = form(this.credenciales, (esquema) => {
    required(esquema.usuario, { message: 'Ingresa tu correo o usuario' });
    required(esquema.contrasena, { message: 'Ingresa tu contraseña' });
  });

  constructor() {
    afterNextRender(() => {
      if (this.auth.autenticado()) {
        this.router.navigate(['/inventario']);
      }
    });
  }

  alternarContrasena(): void {
    this.mostrarContrasena.update((visible) => !visible);
  }

  iniciarSesion(evento: Event): void {
    evento.preventDefault();

    if (this.formulario().invalid()) {
      this.formulario().markAsTouched();
      return;
    }

    const { usuario, contrasena } = this.credenciales();
    this.auth.iniciarSesion(usuario.trim(), contrasena).subscribe((respuesta) => {
      if (respuesta) {
        this.router.navigate(['/inventario']);
      }
    });
  }
}
