import { Correo } from '../models/Correo';

export enum TipoBandeja {
  ENTRADA = 'ENTRADA',
  ENVIADOS = 'ENVIADOS',
  BORRADORES = 'BORRADORES',
  ELIMINADOS = 'ELIMINADOS',
}

export class Bandeja {
  private readonly _tipo: TipoBandeja;
  protected readonly _correos: Map<string, Correo>;

  constructor(tipo: TipoBandeja) {
    this._tipo = tipo;
    this._correos = new Map<string, Correo>();
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

  obtenerPorId(idCorreo: string): Correo | undefined {
    return this._correos.get(idCorreo);
  }

  obtenerTodos(): ReadonlyArray<Correo> {
    return Array.from(this._correos.values());
  }

  agregar(correo: Correo): void {
    if (this._correos.has(correo.id)) {
      throw new Error(`El correo con ID "${correo.id}" ya existe en esta bandeja.`);
    }
    this._correos.set(correo.id, correo);
  }

  quitar(idCorreo: string): Correo | null {
    const correo = this._correos.get(idCorreo);
    if (!correo) {
      return null;
    }
    this._correos.delete(idCorreo);
    return correo;
  }
}

export interface RegistroEliminado {
  correo: Correo;
  bandejaOrigen: TipoBandeja;
}

export class BandejaEliminados extends Bandeja {
  private readonly _origenes: Map<string, TipoBandeja>;

  constructor() {
    super(TipoBandeja.ELIMINADOS);
    this._origenes = new Map<string, TipoBandeja>();
  }

  agregarConOrigen(correo: Correo, bandejaOrigen: TipoBandeja): void {
    if (this._correos.has(correo.id)) {
      throw new Error(`El correo con ID "${correo.id}" ya existe en la papelera de eliminados.`);
    }
    this._correos.set(correo.id, correo);
    this._origenes.set(correo.id, bandejaOrigen);
  }

  obtenerOrigen(idCorreo: string): TipoBandeja | undefined {
    return this._origenes.get(idCorreo);
  }

  restaurar(idCorreo: string): RegistroEliminado | null {
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

  override quitar(idCorreo: string): Correo | null {
    this._origenes.delete(idCorreo);
    return super.quitar(idCorreo);
  }
}
