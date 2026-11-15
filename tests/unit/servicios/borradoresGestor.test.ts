import { describe, it, expect, beforeEach } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Borrador } from '../../../src/domain/models/Borrador';
import { TipoBandeja } from '../../../src/domain/bandejas/Bandeja';
import { GestorCorreos } from '../../../src/servicios/GestorCorreos';

describe('GestorCorreos - Borradores y Envio Valido (RF-02 y RF-07 / E3)', () => {
  let gestor: GestorCorreos;
  let remitente: Contacto;
  let alumno1: Contacto;
  let alumno2: Contacto;

  beforeEach(() => {
    gestor = new GestorCorreos();
    remitente = new Contacto('Profesor', 'profesor@ucp.edu.ar');
    alumno1 = new Contacto('Alumno Uno', 'uno@ucp.edu.ar');
    alumno2 = new Contacto('Alumno Dos', 'dos@ucp.edu.ar');
  });

  it('deberia permitir guardar un borrador incompleto en la bandeja de Borradores', () => {
    const borrador = new Borrador({ id: 'b-inc-1' });
    gestor.guardarBorrador(borrador);

    expect(gestor.obtenerUbicacion('b-inc-1')).toBe(TipoBandeja.BORRADORES);
    const recuperado = gestor.obtenerBorrador('b-inc-1');
    expect(recuperado).toBe(borrador);
    expect(recuperado?.esValido()).toBe(false);
  });

  it('deberia permitir recuperar y editar un borrador existente conservando los cambios', () => {
    const borrador = new Borrador({ id: 'b-edit-1', asunto: 'Borrador inicial' });
    gestor.guardarBorrador(borrador);

    const editado = gestor.editarBorrador('b-edit-1', {
      asunto: 'Asunto modificado',
      cuerpo: 'Texto nuevo',
      remitente,
      agregarDestinatario: alumno1,
    });

    expect(editado.asunto).toBe('Asunto modificado');
    expect(editado.cuerpo).toBe('Texto nuevo');
    expect(editado.remitente).toBe(remitente);
    expect(editado.destinatarios).toHaveLength(1);

    // Recuperarlo nuevamente debe reflejar los cambios
    const consultado = gestor.obtenerBorrador('b-edit-1');
    expect(consultado?.asunto).toBe('Asunto modificado');
  });

  it('deberia lanzar error al intentar editar un borrador que no existe', () => {
    expect(() => {
      gestor.editarBorrador('inexistente', { asunto: 'Nuevo' });
    }).toThrow('No se encontro el borrador con id "inexistente".');
  });

  it('enviarBorrador deberia fallar si el borrador es invalido y NO debe moverlo de Borradores', () => {
    const borradorInvalido = new Borrador({ id: 'b-invalido-1', asunto: 'Incompleto' });
    gestor.guardarBorrador(borradorInvalido);

    expect(() => gestor.enviarBorrador('b-invalido-1')).toThrow(
      'El borrador no es valido para convertirse en correo'
    );

    // Debe permanecer intacto en Borradores
    expect(gestor.obtenerUbicacion('b-invalido-1')).toBe(TipoBandeja.BORRADORES);
    expect(gestor.obtenerBandeja(TipoBandeja.ENVIADOS)).toHaveLength(0);
  });

  it('enviarBorrador deberia convertir un borrador valido a Correo, trasladarlo a Enviados y quitarlo de Borradores', () => {
    const borradorValido = new Borrador({
      id: 'b-valido-1',
      asunto: 'Tema de examen',
      cuerpo: 'Adjunto temario',
      remitente,
      destinatarios: [alumno1, alumno2], // Multiples destinatarios
    });
    gestor.guardarBorrador(borradorValido);

    const correoEnviado = gestor.enviarBorrador('b-valido-1');

    expect(correoEnviado.id).toBe('b-valido-1');
    expect(correoEnviado.destinatarios).toHaveLength(2);
    expect(gestor.obtenerUbicacion('b-valido-1')).toBe(TipoBandeja.ENVIADOS);
    expect(gestor.obtenerBorrador('b-valido-1')).toBeUndefined();
    expect(gestor.obtenerBandeja(TipoBandeja.BORRADORES)).toHaveLength(0);
    expect(gestor.obtenerBandeja(TipoBandeja.ENVIADOS)).toHaveLength(1);
  });

  it('no deberia permitir duplicados al intentar enviar un borrador que ya fue enviado', () => {
    const borrador = new Borrador({
      id: 'b-dup-1',
      asunto: 'Asunto',
      cuerpo: 'Cuerpo',
      remitente,
      destinatarios: [alumno1],
    });
    gestor.guardarBorrador(borrador);
    gestor.enviarBorrador('b-dup-1');

    expect(() => gestor.enviarBorrador('b-dup-1')).toThrow(
      'No se encontro el borrador con id "b-dup-1".'
    );
  });
});
