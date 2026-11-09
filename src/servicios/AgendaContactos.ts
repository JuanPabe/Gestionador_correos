import { Contacto } from '../domain/models/Contacto';

export class AgendaContactos {
  private contactos: Map<string, Contacto>;

  constructor() {
    this.contactos = new Map<string, Contacto>();
  }

  cantidad(): number {
    return this.contactos.size;
  }

  consultarTodos(): ReadonlyArray<Contacto> {
    return Array.from(this.contactos.values());
  }

  consultarPorCorreo(correo: string): Contacto | undefined {
    return this.contactos.get(correo.trim().toLowerCase());
  }

  agregar(contacto: Contacto): void {
    const clave = contacto.correo.toLowerCase();
    if (this.contactos.has(clave)) {
      throw new Error(`Ya existe un contacto con el correo "${contacto.correo}".`);
    }
    this.contactos.set(clave, contacto);
  }

  modificar(correoActual: string, nuevoNombre: string): Contacto {
    const clave = correoActual.trim().toLowerCase();
    const contactoExistente = this.contactos.get(clave);

    if (!contactoExistente) {
      throw new Error(`No se encontro el contacto con correo "${correoActual}".`);
    }

    const contactoModificado = new Contacto(nuevoNombre, contactoExistente.correo);
    this.contactos.set(clave, contactoModificado);
    return contactoModificado;
  }

  eliminar(correo: string): boolean {
    const clave = correo.trim().toLowerCase();
    return this.contactos.delete(clave);
  }
}
