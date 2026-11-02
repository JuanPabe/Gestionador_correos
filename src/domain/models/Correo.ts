import { Contacto } from './Contacto';

export interface PropiedadesCorreo {
  id: string;
  asunto: string;
  cuerpo: string;
  remitente: Contacto;
  destinatarios: Contacto[];
  leido?: boolean;
  favorito?: boolean;
  fechaCreacion?: Date;
}

export class Correo {
  private readonly _id: string;
  private readonly _asunto: string;
  private readonly _cuerpo: string;
  private readonly _remitente: Contacto;
  private readonly _destinatarios: Contacto[];
  private readonly _fechaCreacion: Date;
  private _leido: boolean;
  private _favorito: boolean;

  constructor(propiedades: PropiedadesCorreo) {
    this.validar(propiedades);

    this._id = propiedades.id.trim();
    this._asunto = propiedades.asunto.trim();
    this._cuerpo = propiedades.cuerpo;
    this._remitente = propiedades.remitente;
    // Copia defensiva para proteger el encapsulamiento
    this._destinatarios = [...propiedades.destinatarios];
    this._leido = propiedades.leido ?? false;
    this._favorito = propiedades.favorito ?? false;
    this._fechaCreacion = propiedades.fechaCreacion ?? new Date();
  }

  get id(): string {
    return this._id;
  }

  get asunto(): string {
    return this._asunto;
  }

  get cuerpo(): string {
    return this._cuerpo;
  }

  get remitente(): Contacto {
    return this._remitente;
  }

  /**
   * Retorna una copia de la colección de destinatarios
   * para prevenir modificaciones externas directas.
   */
  get destinatarios(): ReadonlyArray<Contacto> {
    return [...this._destinatarios];
  }

  get leido(): boolean {
    return this._leido;
  }

  get favorito(): boolean {
    return this._favorito;
  }

  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  marcarComoLeido(): void {
    this._leido = true;
  }

  marcarComoNoLeido(): void {
    this._leido = false;
  }

  marcarComoFavorito(): void {
    this._favorito = true;
  }

  desmarcarComoFavorito(): void {
    this._favorito = false;
  }

  private validar(propiedades: PropiedadesCorreo): void {
    if (!propiedades.id || propiedades.id.trim().length === 0) {
      throw new Error('El identificador del correo no puede estar vacío.');
    }
    if (!propiedades.asunto || propiedades.asunto.trim().length === 0) {
      throw new Error('El asunto del correo no puede estar vacío.');
    }
    if (!propiedades.remitente) {
      throw new Error('El correo debe tener un remitente válido.');
    }
    if (!propiedades.destinatarios || propiedades.destinatarios.length === 0) {
      throw new Error('El correo debe tener al menos un destinatario.');
    }
  }
}
