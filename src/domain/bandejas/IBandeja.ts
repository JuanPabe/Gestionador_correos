import { TipoBandeja } from './Bandeja';

// Interfaz base para cualquier elemento que pueda almacenarse en una bandeja
export interface ElementoConId {
  readonly id: string;
}

// Contrato formal para cualquier bandeja física del sistema (SOLID: ISP e Inversion de Dependencias)
export interface IBandeja<T extends ElementoConId = any> {
  readonly tipo: TipoBandeja;
  cantidad(): number;
  contiene(id: string): boolean;
  obtenerPorId(id: string): T | undefined;
  obtenerTodos(): ReadonlyArray<T>;
  agregar(elemento: T): void;
  quitar(id: string): T | null;
}
