import { describe, it, expect, beforeEach } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Correo } from '../../../src/domain/models/Correo';

describe('Correo (RF-01: Creación de correos electrónicos)', () => {
  let remitente: Contacto;
  let destinatario1: Contacto;
  let destinatario2: Contacto;

  beforeEach(() => {
    remitente = new Contacto('Docente UCP', 'profesor@ucp.edu.ar');
    destinatario1 = new Contacto('Juan Alumno', 'juan@ucp.edu.ar');
    destinatario2 = new Contacto('Maria Alumna', 'maria@ucp.edu.ar');
  });

  it('debería instanciar un correo válido con todas sus propiedades obligatorias', () => {
    const correo = new Correo({
      id: 'correo-1',
      asunto: 'Notas del Examen',
      cuerpo: 'Adjunto las calificaciones del primer parcial.',
      remitente: remitente,
      destinatarios: [destinatario1, destinatario2],
    });

    expect(correo.id).toBe('correo-1');
    expect(correo.asunto).toBe('Notas del Examen');
    expect(correo.cuerpo).toBe('Adjunto las calificaciones del primer parcial.');
    expect(correo.remitente).toBe(remitente);
    expect(correo.destinatarios).toHaveLength(2);
    expect(correo.destinatarios[0]).toBe(destinatario1);
    expect(correo.destinatarios[1]).toBe(destinatario2);
    expect(correo.leido).toBe(false); // Por defecto no leído
    expect(correo.favorito).toBe(false); // Por defecto no favorito
    expect(correo.fechaCreacion).toBeInstanceOf(Date);
  });

  it('debería lanzar un error si el id está vacío', () => {
    expect(() => {
      new Correo({
        id: '   ',
        asunto: 'Asunto',
        cuerpo: 'Cuerpo',
        remitente: remitente,
        destinatarios: [destinatario1],
      });
    }).toThrow('El identificador del correo no puede estar vacío.');
  });

  it('debería lanzar un error si el asunto está vacío', () => {
    expect(() => {
      new Correo({
        id: 'correo-2',
        asunto: '   ',
        cuerpo: 'Cuerpo',
        remitente: remitente,
        destinatarios: [destinatario1],
      });
    }).toThrow('El asunto del correo no puede estar vacío.');
  });

  it('debería lanzar un error si no tiene remitente', () => {
    expect(() => {
      new Correo({
        id: 'correo-3',
        asunto: 'Asunto',
        cuerpo: 'Cuerpo',
        remitente: null as unknown as Contacto,
        destinatarios: [destinatario1],
      });
    }).toThrow('El correo debe tener un remitente válido.');
  });

  it('debería lanzar un error si la lista de destinatarios está vacía', () => {
    expect(() => {
      new Correo({
        id: 'correo-4',
        asunto: 'Asunto',
        cuerpo: 'Cuerpo',
        remitente: remitente,
        destinatarios: [],
      });
    }).toThrow('El correo debe tener al menos un destinatario.');
  });

  it('debería proteger la colección de destinatarios contra modificaciones externas (encapsulamiento)', () => {
    const destinatariosIniciales = [destinatario1];
    const correo = new Correo({
      id: 'correo-5',
      asunto: 'Privacidad',
      cuerpo: 'Mensaje confidencial',
      remitente: remitente,
      destinatarios: destinatariosIniciales,
    });

    // Modificar el array original no debe alterar los destinatarios internos
    destinatariosIniciales.push(destinatario2);
    expect(correo.destinatarios).toHaveLength(1);

    // Intentar mutar el array devuelto no debe afectar al objeto
    const copiaDestinatarios = correo.destinatarios as Contacto[];
    copiaDestinatarios.push(destinatario2);
    expect(correo.destinatarios).toHaveLength(1);
  });

  it('debería permitir cambiar el estado de lectura (RF-08)', () => {
    const correo = new Correo({
      id: 'correo-6',
      asunto: 'Consulta',
      cuerpo: 'Texto',
      remitente: remitente,
      destinatarios: [destinatario1],
    });

    expect(correo.leido).toBe(false);
    correo.marcarComoLeido();
    expect(correo.leido).toBe(true);
    correo.marcarComoNoLeido();
    expect(correo.leido).toBe(false);
  });

  it('debería permitir marcar y desmarcar como favorito (RF-09)', () => {
    const correo = new Correo({
      id: 'correo-7',
      asunto: 'Urgente',
      cuerpo: 'Texto importante',
      remitente: remitente,
      destinatarios: [destinatario1],
    });

    expect(correo.favorito).toBe(false);
    correo.marcarComoFavorito();
    expect(correo.favorito).toBe(true);
    correo.desmarcarComoFavorito();
    expect(correo.favorito).toBe(false);
  });
});
