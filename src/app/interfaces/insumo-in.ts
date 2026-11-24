export interface InsumoIn {
  nombre: string;
  categoria: string;
  cantidad: number;
  unidadMedida: string;
  stockMinimo: number;
}

export interface Insumo extends InsumoIn {
  id: number;
}
