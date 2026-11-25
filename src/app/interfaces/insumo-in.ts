export interface InsumoEntrada {
  nombre: string;
  cantidad: number;
  stockMinimo: number;
  idCategoria: number;
  idUnidad: number;
}

export interface Insumo extends InsumoEntrada {
  id: number;
  categoria: string;
  unidadMedida: string;
  fechaRegistro: string | null;
}

export type EstadoInsumo = 'abastecido' | 'critico';
export type PrioridadInsumo = 'alta' | 'media';
