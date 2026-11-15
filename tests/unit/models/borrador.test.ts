import { describe, it, expect, beforeEach } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Borrador } from '../../../src/domain/models/Borrador';

describe('Borrador (RF-07: Gestion de borradores incompletos y mutables)', () => {
  let remitente: Contacto;
  let destinatario: Contacto;

  beforeEach(() => {
    remitente = new Contacto('Profesor', 'profesor@ucp.edu.ar');
    destinatario = new Contacto('Alumno', 'alumno@ucp.edu.ar');
  });

  it('deberia permitir crear un borrador completamente vacio salvo por su ID', () => {
    const borrador = new Borrador({ id: 'b1' });
    expect(borrador.id).toBe('b1');
    expect(borrador.asunto).toBe('');
    expect(borrador.cuerpo).toBe('');
    expect(borrador.remitente).toBeUndefined();
    expect(borrador.destinatarios).toEqual([]);
    expect(borrador.esValido()).toBe(false);
  });

  it('deberia lanzar error si se crea un borrador sin id', () => {
    expect(() => new Borrador({ id: '   ' })).toThrow('El identificador del borrador no puede estar vacio.');
  });

  it('deberia permitir editar asunto, cuerpo y remitente', () => {
    const borrador = new Borrador({ id: 'b2' });
    borrador.editarAsunto('Consulta Parcial');
    borrador.editarCuerpo('Tengo dudas con el ejercicio 3');
    borrador.definirRemitente(remitente);

    expect(borrador.asunto).toBe('Consulta Parcial');
    expect(borrador.cuerpo).toBe('Tengo dudas con el ejercicio 3');
    expect(borrador.remitente).toBe(remitente);
  });

  it('deberia permitir agregar y quitar destinatarios con copia defensiva', () => {
    const borrador = new Borrador({ id: 'b3' });
    borrador.agregarDestinatario(destinatario);

    expect(borrador.destinatarios).toHaveLength(1);
    expect(borrador.destinatarios[0]).toBe(destinatario);

    // Intentar mutar la coleccion externa no debe alterar el interior
    const listaExterna = borrador.destinatarios as Contacto[];
    listaExterna.push(new Contacto('Otro', 'otro@ucp.edu.ar'));
    expect(borrador.destinatarios).toHaveLength(1);

    // Quitar destinatario
    borrador.quitarDestinatario(destinatario.correo);
    expect(borrador.destinatarios).toHaveLength(0);
  });

  it('deberia evaluar esValido() en true solo si tiene remitente, asunto y al menos 1 destinatario', () => {
    const borrador = new Borrador({ id: 'b4' });
    expect(borrador.esValido()).toBe(false);

    borrador.definirRemitente(remitente);
    expect(borrador.esValido()).toBe(false);

    borrador.editarAsunto('Listo');
    expect(borrador.esValido()).toBe(false);

    borrador.agregarDestinatario(destinatario);
    expect(borrador.esValido()).toBe(true);
  });

  it('aCorreo() deberia lanzar error si el borrador es invalido', () => {
    const borrador = new Borrador({ id: 'b5' });
    expect(() => borrador.aCorreo()).toThrow('El borrador no es valido para convertirse en correo');
  });

  it('aCorreo() deberia convertir un borrador valido en una entidad Correo inmutable', () => {
    const borrador = new Borrador({
      id: 'b6',
      asunto: 'Tema Final',
      cuerpo: 'Contenido',
      remitente,
      destinatarios: [destinatario],
    });

    const correo = borrador.aCorreo();
    expect(correo.id).toBe('b6');
    expect(correo.asunto).toBe('Tema Final');
    expect(correo.cuerpo).toBe('Contenido');
    expect(correo.remitente).toBe(remitente);
    expect(correo.destinatarios).toHaveLength(1);
  });
});
