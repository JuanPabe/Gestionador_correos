import { describe, it, expect, beforeEach } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Correo } from '../../../src/domain/models/Correo';
import { TipoBandeja } from '../../../src/domain/bandejas/Bandeja';
import { GestorCorreos } from '../../../src/servicios/GestorCorreos';

describe('GestorCorreos (RF-02 y RF-06: Envio y Gestion de Bandejas)', () => {
  let gestor: GestorCorreos;
  let remitente: Contacto;
  let destinatario: Contacto;
  let correo: Correo;

  beforeEach(() => {
    gestor = new GestorCorreos();
    remitente = new Contacto('Profesor UCP', 'profesor@ucp.edu.ar');
    destinatario = new Contacto('Alumno UCP', 'alumno@ucp.edu.ar');

    correo = new Correo({
      id: 'correo-1',
      asunto: 'Examen Final',
      cuerpo: 'Temario del examen',
      remitente,
      destinatarios: [destinatario],
    });
  });

  describe('Recepcion y Envio de Correos (RF-02)', () => {
    it('deberia recibir un correo y guardarlo en la bandeja de Entrada', () => {
      gestor.recibir(correo);

      const entrada = gestor.obtenerBandeja(TipoBandeja.ENTRADA);
      expect(entrada).toHaveLength(1);
      expect(entrada[0]).toBe(correo);
      expect(gestor.obtenerUbicacion(correo.id)).toBe(TipoBandeja.ENTRADA);
    });

    it('deberia enviar un correo y guardarlo en la bandeja de Enviados', () => {
      gestor.enviar(correo);

      const enviados = gestor.obtenerBandeja(TipoBandeja.ENVIADOS);
      expect(enviados).toHaveLength(1);
      expect(enviados[0]).toBe(correo);
      expect(gestor.obtenerUbicacion(correo.id)).toBe(TipoBandeja.ENVIADOS);
    });

    it('si se envia un correo que estaba en Borradores, debe dejar de pertenecer a Borradores', () => {
      gestor.guardarEnBorradores(correo);
      expect(gestor.obtenerBandeja(TipoBandeja.BORRADORES)).toHaveLength(1);

      gestor.enviar(correo);

      expect(gestor.obtenerBandeja(TipoBandeja.BORRADORES)).toHaveLength(0);
      expect(gestor.obtenerBandeja(TipoBandeja.ENVIADOS)).toHaveLength(1);
      expect(gestor.obtenerUbicacion(correo.id)).toBe(TipoBandeja.ENVIADOS);
    });

    it('no deberia duplicar correos al enviar el mismo correo dos veces', () => {
      gestor.enviar(correo);
      expect(() => gestor.enviar(correo)).toThrow();
    });
  });

  describe('Movimiento y Pertenencia Unica entre Bandejas (RF-06)', () => {
    it('un correo debe pertenecer a una unica bandeja fisica a la vez al moverse', () => {
      gestor.recibir(correo);
      expect(gestor.obtenerUbicacion(correo.id)).toBe(TipoBandeja.ENTRADA);

      gestor.mover(correo.id, TipoBandeja.ENVIADOS);

      expect(gestor.obtenerBandeja(TipoBandeja.ENTRADA)).toHaveLength(0);
      expect(gestor.obtenerBandeja(TipoBandeja.ENVIADOS)).toHaveLength(1);
      expect(gestor.obtenerUbicacion(correo.id)).toBe(TipoBandeja.ENVIADOS);
    });

    it('deberia lanzar error si se intenta mover un correo inexistente', () => {
      expect(() => {
        gestor.mover('no-existe', TipoBandeja.ENVIADOS);
      }).toThrow('No se encontro el correo con id "no-existe" en ninguna bandeja.');
    });
  });

  describe('Eliminacion y Restauracion con Memoria de Origen (RF-06)', () => {
    it('deberia eliminar logicamente un correo trasladandolo a Eliminados', () => {
      gestor.recibir(correo);
      gestor.eliminar(correo.id);

      expect(gestor.obtenerBandeja(TipoBandeja.ENTRADA)).toHaveLength(0);
      expect(gestor.obtenerBandeja(TipoBandeja.ELIMINADOS)).toHaveLength(1);
      expect(gestor.obtenerUbicacion(correo.id)).toBe(TipoBandeja.ELIMINADOS);
    });

    it('deberia restaurar un correo eliminado a su bandeja de origen', () => {
      gestor.recibir(correo);
      gestor.eliminar(correo.id);

      gestor.restaurar(correo.id);

      expect(gestor.obtenerBandeja(TipoBandeja.ENTRADA)).toHaveLength(1);
      expect(gestor.obtenerBandeja(TipoBandeja.ELIMINADOS)).toHaveLength(0);
      expect(gestor.obtenerUbicacion(correo.id)).toBe(TipoBandeja.ENTRADA);
    });

    it('deberia restaurar a Borradores si el correo fue eliminado desde Borradores', () => {
      gestor.guardarEnBorradores(correo);
      gestor.eliminar(correo.id);

      gestor.restaurar(correo.id);

      expect(gestor.obtenerBandeja(TipoBandeja.BORRADORES)).toHaveLength(1);
      expect(gestor.obtenerBandeja(TipoBandeja.ELIMINADOS)).toHaveLength(0);
      expect(gestor.obtenerUbicacion(correo.id)).toBe(TipoBandeja.BORRADORES);
    });

    it('deberia lanzar error al intentar restaurar un correo que no esta en eliminados', () => {
      expect(() => {
        gestor.restaurar('no-esta-en-papelera');
      }).toThrow('No se puede restaurar el correo "no-esta-en-papelera" porque no esta en Eliminados.');
    });
  });

  describe('Consultas de No Leidos (RF-08)', () => {
    it('deberia obtener todos los correos no leidos de una bandeja', () => {
      const correo2 = new Correo({
        id: 'correo-2',
        asunto: 'Consulta',
        cuerpo: 'Duda sobre TP',
        remitente,
        destinatarios: [destinatario],
      });

      gestor.recibir(correo);
      gestor.recibir(correo2);

      expect(gestor.obtenerNoLeidos(TipoBandeja.ENTRADA)).toHaveLength(2);

      correo.marcarComoLeido();

      const noLeidos = gestor.obtenerNoLeidos(TipoBandeja.ENTRADA);
      expect(noLeidos).toHaveLength(1);
      expect(noLeidos[0]).toBe(correo2);
    });
  });

  describe('Vista Transversal de Favoritos (RF-09)', () => {
    it('deberia listar los favoritos de distintas bandejas activas sin duplicados', () => {
      const correoEnviado = new Correo({
        id: 'correo-env-1',
        asunto: 'Envio TP',
        cuerpo: 'Adjunto TP',
        remitente,
        destinatarios: [destinatario],
      });

      correo.marcarComoFavorito();
      correoEnviado.marcarComoFavorito();

      gestor.recibir(correo);
      gestor.enviar(correoEnviado);

      const favoritos = gestor.obtenerFavoritos();
      expect(favoritos).toHaveLength(2);
      expect(favoritos).toContain(correo);
      expect(favoritos).toContain(correoEnviado);
    });

    it('marcar como favorito no debe mover el correo de su bandeja original', () => {
      gestor.recibir(correo);
      correo.marcarComoFavorito();

      expect(gestor.obtenerUbicacion(correo.id)).toBe(TipoBandeja.ENTRADA);
    });

    it('un correo favorito en Eliminados no debe aparecer en la vista de favoritos hasta que se restaure', () => {
      gestor.recibir(correo);
      correo.marcarComoFavorito();

      expect(gestor.obtenerFavoritos()).toHaveLength(1);

      gestor.eliminar(correo.id);

      expect(correo.favorito).toBe(true);
      expect(gestor.obtenerFavoritos()).toHaveLength(0);

      gestor.restaurar(correo.id);
      expect(gestor.obtenerFavoritos()).toHaveLength(1);
      expect(gestor.obtenerFavoritos()[0]).toBe(correo);
    });
  });
});
