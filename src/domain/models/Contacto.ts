export class Contacto {
  private readonly _nombre: string;
  private readonly _correo: string;

  constructor(nombre: string, correo: string) {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre del contacto no puede estar vacío.');
    }
    if (!this.esCorreoValido(correo)) {
      throw new Error('El correo electrónico no tiene un formato válido.');
    }
    this._nombre = nombre.trim();
    this._correo = correo.trim().toLowerCase();
  }

  get nombre(): string {
    return this._nombre;
  }

  get correo(): string {
    return this._correo;
  }

  private esCorreoValido(correo: string): boolean {
    const expresionRegular = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresionRegular.test(correo);
  }
}
