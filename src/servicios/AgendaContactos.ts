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

  modificar(
    correoActual: string,
    nuevoNombre: string,
    nuevoCorreo?: string
  ): Contacto {
    const claveActual = correoActual.trim().toLowerCase();
    const contactoExistente = this.contactos.get(claveActual);

    if (!contactoExistente) {
      throw new Error(`No se encontro el contacto con correo "${correoActual}".`);
    }

    const correoDestino = nuevoCorreo
      ? nuevoCorreo.trim().toLowerCase()
      : contactoExistente.correo;

    // Si cambia de direccion, valida que no colisione con otro contacto existente
    if (correoDestino !== claveActual && this.contactos.has(correoDestino)) {
      throw new Error(`Ya existe otro contacto con el correo "${nuevoCorreo}".`);
    }

    // Instancia el contacto aplicando validaciones de formato de email (RF-03)
    const contactoModificado = new Contacto(nuevoNombre, correoDestino);

    if (correoDestino !== claveActual) {
      this.contactos.delete(claveActual);
    }

    this.contactos.set(correoDestino, contactoModificado);
    return contactoModificado;
  }

  eliminar(correo: string): boolean {
    const clave = correo.trim().toLowerCase();
    return this.contactos.delete(clave);
  }
}
