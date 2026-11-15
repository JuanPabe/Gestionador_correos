import { Correo } from '../models/Correo';
import { ElementoConId, IBandeja } from './IBandeja';

export enum TipoBandeja {
  ENTRADA = 'ENTRADA',
  ENVIADOS = 'ENVIADOS',
  BORRADORES = 'BORRADORES',
  ELIMINADOS = 'ELIMINADOS',
}

// Implementacion generica de bandeja fisica que satisface el contrato IBandeja (SOLID: OCP y LSP)
export class Bandeja<T extends ElementoConId = Correo> implements IBandeja<T> {
  private readonly _tipo: TipoBandeja;
  protected readonly _correos: Map<string, T>;

  constructor(tipo: TipoBandeja) {
    this._tipo = tipo;
    this._correos = new Map<string, T>();
  }

  get tipo(): TipoBandeja {
    return this._tipo;
  }

  cantidad(): number {
    return this._correos.size;
  }

  contiene(idCorreo: string): boolean {
    return this._correos.has(idCorreo);
  }

  obtenerPorId(idCorreo: string): T | undefined {
    return this._correos.get(idCorreo);
  }

  obtenerTodos(): ReadonlyArray<T> {
    return Array.from(this._correos.values());
  }

  agregar(correo: T): void {
    if (this._correos.has(correo.id)) {
      throw new Error(`El correo con ID "${correo.id}" ya existe en esta bandeja.`);
    }
    this._correos.set(correo.id, correo);
  }

  quitar(idCorreo: string): T | null {
    const correo = this._correos.get(idCorreo);
    if (!correo) {
      return null;
    }
    this._correos.delete(idCorreo);
    return correo;
  }
}

export interface RegistroEliminado<T extends ElementoConId = Correo> {
  correo: T;
  bandejaOrigen: TipoBandeja;
}

// Subclase especializada de papelera que recuerda la bandeja fisica de procedencia (POO: Herencia)
export class BandejaEliminados<T extends ElementoConId = Correo> extends Bandeja<T> {
  private readonly _origenes: Map<string, TipoBandeja>;

  constructor() {
    super(TipoBandeja.ELIMINADOS);
    this._origenes = new Map<string, TipoBandeja>();
  }

  agregarConOrigen(correo: T, bandejaOrigen: TipoBandeja): void {
    if (this._correos.has(correo.id)) {
      throw new Error(`El correo con ID "${correo.id}" ya existe en la papelera de eliminados.`);
    }
    this._correos.set(correo.id, correo);
    this._origenes.set(correo.id, bandejaOrigen);
  }

  obtenerOrigen(idCorreo: string): TipoBandeja | undefined {
    return this._origenes.get(idCorreo);
  }

  restaurar(idCorreo: string): RegistroEliminado<T> | null {
    const bandejaOrigen = this._origenes.get(idCorreo);
    if (!bandejaOrigen) {
      return null;
    }
    const correo = this.quitar(idCorreo);
    if (!correo) {
      return null;
    }

    return {
      correo,
      bandejaOrigen,
    };
  }

  override quitar(idCorreo: string): T | null {
    this._origenes.delete(idCorreo);
    return super.quitar(idCorreo);
  }
}
