import { describe, it, expect } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';

describe('Contacto (RF-03: Gestión de contactos)', () => {
  it('debería instanciar un contacto con nombre y correo válidos', () => {
    const contacto = new Contacto('Juan Perez', 'juan@ucp.edu.ar');
    expect(contacto.nombre).toBe('Juan Perez');
    expect(contacto.correo).toBe('juan@ucp.edu.ar');
  });

  it('debería lanzar un error si el correo no tiene un formato válido', () => {
    expect(() => new Contacto('Juan Perez', 'correo-invalido')).toThrow(
      'El correo electrónico no tiene un formato válido.'
    );
  });

  it('debería lanzar un error si el nombre está vacío', () => {
    expect(() => new Contacto('   ', 'juan@ucp.edu.ar')).toThrow(
      'El nombre del contacto no puede estar vacío.'
    );
  });
});
