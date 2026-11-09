import { Correo } from '../models/Correo';
import { Predicado } from './Predicados';

export class Filtro {
  private readonly _nombre: string;
  private readonly _predicado: Predicado;

  constructor(nombre: string, predicado: Predicado) {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre del filtro no puede estar vacío.');
    }
    this._nombre = nombre.trim();
    this._predicado = predicado;
  }

  get nombre(): string {
    return this._nombre;
  }

  aplicar(correos: ReadonlyArray<Correo>): Correo[] {
    return correos.filter((correo) => this._predicado(correo));
  }
}