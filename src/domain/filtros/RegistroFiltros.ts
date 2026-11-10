import { Filtro } from './Filtro';

export class RegistroFiltros {
  static readonly MAXIMO = 5;
  private readonly _filtros: Map<string, Filtro> = new Map();

  cantidad(): number {
    return this._filtros.size;
  }

  registrar(filtro: Filtro): void {
    const clave = filtro.nombre.toLowerCase();
    if (this._filtros.has(clave)) {
      throw new Error(`Ya existe un filtro llamado "${filtro.nombre}".`);
    }
    if (this._filtros.size >= RegistroFiltros.MAXIMO) {
      throw new Error(`No se pueden registrar más de ${RegistroFiltros.MAXIMO} filtros.`);
    }
    this._filtros.set(clave, filtro);
  }

  obtener(nombre: string): Filtro | undefined {
    return this._filtros.get(nombre.trim().toLowerCase());
  }

  listar(): ReadonlyArray<Filtro> {
    return Array.from(this._filtros.values());
  }
}