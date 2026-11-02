import { describe, it, expect, beforeEach } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Correo } from '../../../src/domain/models/Correo';
import {
  Bandeja,
  BandejaEliminados,
  TipoBandeja,
} from '../../../src/domain/bandejas/Bandeja';

describe('Gestión de Bandejas Físicas (RF-06)', () => {
  let remitente: Contacto;
  let destinatario: Contacto;
  let correo1: Correo;
  let correo2: Correo;

  beforeEach(() => {
    remitente = new Contacto('Profesor', 'profesor@ucp.edu.ar');
    destinatario = new Contacto('Alumno', 'alumno@ucp.edu.ar');

    correo1 = new Correo({
      id: 'correo-1',
      asunto: 'Bienvenida',
      cuerpo: 'Hola a todos',
      remitente,
      destinatarios: [destinatario],
    });

    correo2 = new Correo({
      id: 'correo-2',
      asunto: 'TP Integrador',
      cuerpo: 'Consigna del trabajo',
      remitente,
      destinatarios: [destinatario],
    });
  });

  describe('Bandeja Estándar (Entrada, Enviados, Borradores)', () => {
    it('debería inicializarse vacía y con su tipo correspondiente', () => {
      const bandejaEntrada = new Bandeja(TipoBandeja.ENTRADA);
      expect(bandejaEntrada.tipo).toBe(TipoBandeja.ENTRADA);
      expect(bandejaEntrada.cantidad()).toBe(0);
      expect(bandejaEntrada.obtenerTodos()).toEqual([]);
    });

    it('debería permitir agregar correos y consultar por id', () => {
      const bandeja = new Bandeja(TipoBandeja.ENTRADA);
      bandeja.agregar(correo1);

      expect(bandeja.cantidad()).toBe(1);
      expect(bandeja.contiene(correo1.id)).toBe(true);
      expect(bandeja.obtenerPorId(correo1.id)).toBe(correo1);
    });

    it('no debería permitir agregar correos duplicados con el mismo ID', () => {
      const bandeja = new Bandeja(TipoBandeja.ENTRADA);
      bandeja.agregar(correo1);

      expect(() => bandeja.agregar(correo1)).toThrow(
        `El correo con ID "${correo1.id}" ya existe en esta bandeja.`
      );
    });

    it('debería permitir quitar un correo existente de la bandeja', () => {
      const bandeja = new Bandeja(TipoBandeja.ENTRADA);
      bandeja.agregar(correo1);
      bandeja.agregar(correo2);

      const correoQuitado = bandeja.quitar(correo1.id);

      expect(correoQuitado).toBe(correo1);
      expect(bandeja.cantidad()).toBe(1);
      expect(bandeja.contiene(correo1.id)).toBe(false);
    });

    it('debería devolver null al intentar quitar un correo que no está en la bandeja', () => {
      const bandeja = new Bandeja(TipoBandeja.ENTRADA);
      const resultado = bandeja.quitar('id-inexistente');
      expect(resultado).toBeNull();
    });

    it('debería retornar una colección inmutable o copia defensiva al consultar todos los correos', () => {
      const bandeja = new Bandeja(TipoBandeja.ENTRADA);
      bandeja.agregar(correo1);

      const todos = bandeja.obtenerTodos() as Correo[];
      todos.push(correo2);

      // La bandeja original no debe haber sido modificada
      expect(bandeja.cantidad()).toBe(1);
    });
  });

  describe('Bandeja de Eliminados (con memoria de origen para restauración)', () => {
    it('debería registrar un correo eliminado asociando su bandeja de origen', () => {
      const eliminados = new BandejaEliminados();
      eliminados.agregarConOrigen(correo1, TipoBandeja.ENTRADA);

      expect(eliminados.cantidad()).toBe(1);
      expect(eliminados.contiene(correo1.id)).toBe(true);
      expect(eliminados.obtenerOrigen(correo1.id)).toBe(TipoBandeja.ENTRADA);
    });

    it('no debería permitir agregar a eliminados un correo duplicado', () => {
      const eliminados = new BandejaEliminados();
      eliminados.agregarConOrigen(correo1, TipoBandeja.ENTRADA);

      expect(() =>
        eliminados.agregarConOrigen(correo1, TipoBandeja.ENTRADA)
      ).toThrow(`El correo con ID "${correo1.id}" ya existe en la papelera de eliminados.`);
    });

    it('debería permitir restaurar un correo eliminado obteniendo el correo y su bandeja de origen', () => {
      const eliminados = new BandejaEliminados();
      eliminados.agregarConOrigen(correo1, TipoBandeja.BORRADORES);

      const restaurado = eliminados.restaurar(correo1.id);

      expect(restaurado).not.toBeNull();
      expect(restaurado?.correo).toBe(correo1);
      expect(restaurado?.bandejaOrigen).toBe(TipoBandeja.BORRADORES);

      // Ya no debe estar en eliminados
      expect(eliminados.contiene(correo1.id)).toBe(false);
      expect(eliminados.cantidad()).toBe(0);
    });

    it('debería devolver null al intentar restaurar un correo que no existe en eliminados', () => {
      const eliminados = new BandejaEliminados();
      const resultado = eliminados.restaurar('inexistente');
      expect(resultado).toBeNull();
    });
  });
});
