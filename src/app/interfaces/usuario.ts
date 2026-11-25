export interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
  rol: string;
  iniciales: string;
}

export interface RespuestaLogin {
  tokenAcceso: string;
  tipoToken: string;
  expiraEn: number;
  usuario: Usuario;
}
