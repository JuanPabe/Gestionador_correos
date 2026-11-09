import { describe, it, expect, beforeEach } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';
import { AgendaContactos } from '../../../src/servicios/AgendaContactos';

describe('AgendaContactos (RF-03: Gestion de contactos)', () => {
  let agenda: AgendaContactos;
  let contacto1: Contacto;
  let contacto2: Contacto;

  beforeEach(() => {
    agenda = new AgendaContactos();
    contacto1 = new Contacto('Juan Perez', 'juan@ucp.edu.ar');
    contacto2 = new Contacto('Maria Gomez', 'maria@ucp.edu.ar');
  });

  it('deberia iniciar vacia', () => {
    expect(agenda.cantidad()).toBe(0);
    expect(agenda.consultarTodos()).toEqual([]);
  });

  it('deberia agregar contactos correctamente', () => {
    agenda.agregar(contacto1);
    expect(agenda.cantidad()).toBe(1);
    expect(agenda.consultarPorCorreo('juan@ucp.edu.ar')).toBe(contacto1);
  });

  it('deberia impedir contactos duplicados por direccion de correo electronico', () => {
    agenda.agregar(contacto1);
    const contactoDuplicado = new Contacto('Juan Otro', 'juan@ucp.edu.ar');

    expect(() => agenda.agregar(contactoDuplicado)).toThrow(
      'Ya existe un contacto con el correo "juan@ucp.edu.ar".'
    );
  });

  it('deberia permitir consultar todos los contactos sin exponer la coleccion interna', () => {
    agenda.agregar(contacto1);
    const lista = agenda.consultarTodos() as Contacto[];
    lista.push(contacto2);

    expect(agenda.cantidad()).toBe(1);
  });

  it('deberia permitir modificar el nombre de un contacto existente', () => {
    agenda.agregar(contacto1);
    const modificado = agenda.modificar('juan@ucp.edu.ar', 'Juan Manuel Perez');

    expect(modificado.nombre).toBe('Juan Manuel Perez');
    expect(modificado.correo).toBe('juan@ucp.edu.ar');
    expect(agenda.consultarPorCorreo('juan@ucp.edu.ar')?.nombre).toBe('Juan Manuel Perez');
  });

  it('deberia lanzar error al intentar modificar un contacto que no existe', () => {
    expect(() => {
      agenda.modificar('noexiste@ucp.edu.ar', 'Nuevo Nombre');
    }).toThrow('No se encontro el contacto con correo "noexiste@ucp.edu.ar".');
  });

  it('deberia permitir eliminar un contacto de la agenda', () => {
    agenda.agregar(contacto1);
    agenda.agregar(contacto2);

    const eliminado = agenda.eliminar('juan@ucp.edu.ar');
    expect(eliminado).toBe(true);
    expect(agenda.cantidad()).toBe(1);
    expect(agenda.consultarPorCorreo('juan@ucp.edu.ar')).toBeUndefined();
  });

  it('deberia devolver false si se intenta eliminar un contacto inexistente', () => {
    const eliminado = agenda.eliminar('inexistente@ucp.edu.ar');
    expect(eliminado).toBe(false);
  });
});
