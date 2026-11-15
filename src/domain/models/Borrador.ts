import { Contacto } from './Contacto';
import { Correo } from './Correo';
import { ElementoConId } from '../bandejas/IBandeja';

export interface PropiedadesBorrador {
  id: string;
  asunto?: string;
  cuerpo?: string;
  remitente?: Contacto;
  destinatarios?: Contacto[];
}

// Entidad Borrador mutable que permite composicion incremental antes del envio definitivo (RF-07)
export class Borrador implements ElementoConId {
  private readonly _id: string;
  private _asunto: string;
  private _cuerpo: string;
  private _remitente?: Contacto;
  private _destinatarios: Contacto[];

  constructor(propiedades: PropiedadesBorrador) {
    if (!propiedades.id || propiedades.id.trim().length === 0) {
      throw new Error('El identificador del borrador no puede estar vacio.');
    }

    this._id = propiedades.id.trim();
    this._asunto = propiedades.asunto ? propiedades.asunto.trim() : '';
    this._cuerpo = propiedades.cuerpo ?? '';
    this._remitente = propiedades.remitente;
    this._destinatarios = propiedades.destinatarios ? [...propiedades.destinatarios] : [];
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

  get remitente(): Contacto | undefined {
    return this._remitente;
  }

  get destinatarios(): ReadonlyArray<Contacto> {
    return [...this._destinatarios];
  }

  editarAsunto(nuevoAsunto: string): void {
    this._asunto = nuevoAsunto.trim();
  }

  editarCuerpo(nuevoCuerpo: string): void {
    this._cuerpo = nuevoCuerpo;
  }

  definirRemitente(remitente: Contacto): void {
    this._remitente = remitente;
  }

  agregarDestinatario(destinatario: Contacto): void {
    this._destinatarios.push(destinatario);
  }

  quitarDestinatario(correo: string): void {
    const buscado = correo.trim().toLowerCase();
    this._destinatarios = this._destinatarios.filter(
      (d) => d.correo.toLowerCase() !== buscado
    );
  }

  esValido(): boolean {
    return (
      this._remitente !== undefined &&
      this._asunto.length > 0 &&
      this._destinatarios.length > 0
    );
  }

  aCorreo(): Correo {
    if (!this.esValido()) {
      throw new Error(
        'El borrador no es valido para convertirse en correo (requiere remitente, asunto y al menos un destinatario).'
      );
    }

    return new Correo({
      id: this._id,
      asunto: this._asunto,
      cuerpo: this._cuerpo,
      remitente: this._remitente!,
      destinatarios: [...this._destinatarios],
    });
  }
}
