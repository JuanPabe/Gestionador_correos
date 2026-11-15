import { describe, it, expect, beforeEach } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Correo } from '../../../src/domain/models/Correo';
import { Borrador } from '../../../src/domain/models/Borrador';
import { TipoBandeja } from '../../../src/domain/bandejas/Bandeja';
import { GestorCorreos } from '../../../src/servicios/GestorCorreos';

describe('Pertenencia Unica y Validacion de Movimientos (RF-02 y RF-06 / E1 y E2)', () => {
  let gestor: GestorCorreos;
  let remitente: Contacto;
  let destinatario: Contacto;
  let correo: Correo;

  beforeEach(() => {
    gestor = new GestorCorreos();
    remitente = new Contacto('Profesor', 'profesor@ucp.edu.ar');
    destinatario = new Contacto('Alumno', 'alumno@ucp.edu.ar');
    correo = new Correo({
      id: 'c-unico-1',
      asunto: 'Importante',
      cuerpo: 'Mensaje',
      remitente,
      destinatarios: [destinatario],
    });
  });

  describe('Control global de duplicados entre bandejas (E1)', () => {
    it('no deberia permitir enviar un correo que ya fue recibido en Entrada', () => {
      gestor.recibir(correo);
      expect(() => gestor.enviar(correo)).toThrow(
        'No se puede enviar el correo con ID "c-unico-1" porque ya pertenece a la bandeja ENTRADA.'
      );
    });

    it('no deberia permitir recibir un correo con un ID que ya existe en Enviados', () => {
      gestor.enviar(correo);
      expect(() => gestor.recibir(correo)).toThrow(
        'El correo con ID "c-unico-1" ya existe en el sistema (bandeja ENVIADOS).'
      );
    });

    it('no deberia permitir guardar un borrador con un ID que ya existe en otra bandeja', () => {
      gestor.recibir(correo);
      const borradorConMismoId = new Borrador({ id: 'c-unico-1' });
      expect(() => gestor.guardarBorrador(borradorConMismoId)).toThrow(
        'El elemento con ID "c-unico-1" ya existe en el sistema (bandeja ENTRADA).'
      );
    });

    it('no deberia permitir enviar un correo que ya esta en Eliminados', () => {
      gestor.recibir(correo);
      gestor.eliminar(correo.id);
      expect(() => gestor.enviar(correo)).toThrow(
        'No se puede enviar el correo con ID "c-unico-1" porque ya pertenece a la bandeja ELIMINADOS.'
      );
    });
  });

  describe('Matriz de movimientos permitidos (E2)', () => {
    it('deberia permitir mover cualquier correo desde una bandeja activa hacia ELIMINADOS', () => {
      gestor.recibir(correo);
      gestor.mover(correo.id, TipoBandeja.ELIMINADOS);
      expect(gestor.obtenerUbicacion(correo.id)).toBe(TipoBandeja.ELIMINADOS);
    });

    it('deberia rechazar el movimiento manual de Entrada a Enviados', () => {
      gestor.recibir(correo);
      expect(() => gestor.mover(correo.id, TipoBandeja.ENVIADOS)).toThrow(
        'Movimiento no permitido: no se puede mover un correo desde ENTRADA hacia ENVIADOS.'
      );
    });

    it('deberia rechazar el movimiento manual de Enviados a Borradores', () => {
      gestor.enviar(correo);
      expect(() => gestor.mover(correo.id, TipoBandeja.BORRADORES)).toThrow(
        'Movimiento no permitido: no se puede mover un correo desde ENVIADOS hacia BORRADORES.'
      );
    });

    it('deberia rechazar el movimiento manual desde Eliminados hacia otra bandeja (debe usarse restaurar)', () => {
      gestor.recibir(correo);
      gestor.eliminar(correo.id);
      expect(() => gestor.mover(correo.id, TipoBandeja.ENTRADA)).toThrow(
        'Movimiento no permitido: no se puede mover un correo desde ELIMINADOS hacia ENTRADA.'
      );
    });
  });

  describe('Eliminacion y restauracion de borradores', () => {
    it('deberia permitir eliminar un borrador y restaurarlo correctamente a la bandeja de Borradores', () => {
      const borrador = new Borrador({ id: 'b-elim-1', asunto: 'Borrador a papelera' });
      gestor.guardarBorrador(borrador);
      expect(gestor.obtenerUbicacion('b-elim-1')).toBe(TipoBandeja.BORRADORES);

      gestor.eliminar('b-elim-1');
      expect(gestor.obtenerUbicacion('b-elim-1')).toBe(TipoBandeja.ELIMINADOS);

      gestor.restaurar('b-elim-1');
      expect(gestor.obtenerUbicacion('b-elim-1')).toBe(TipoBandeja.BORRADORES);
      expect(gestor.obtenerBorrador('b-elim-1')).toBe(borrador);
    });
  });
});
