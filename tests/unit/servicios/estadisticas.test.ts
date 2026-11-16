import { describe, it, expect, beforeEach } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Correo } from '../../../src/domain/models/Correo';
import { TipoBandeja } from '../../../src/domain/bandejas/Bandeja';
import { GestorCorreos } from '../../../src/servicios/GestorCorreos';
import {
  obtenerAsuntos,
  filtrarPor,
  contarNoLeidos,
  contarPorRemitente,
  porcentajeLeidos,
} from '../../../src/servicios/Estadisticas';

describe('Procesamiento Funcional y Estadisticas (RF-10 / T6)', () => {
  let remitente1: Contacto;
  let remitente2: Contacto;
  let destinatario: Contacto;
  let correo1: Correo;
  let correo2: Correo;
  let correo3: Correo;
  let correos: Correo[];

  beforeEach(() => {
    remitente1 = new Contacto('Profesor Uno', 'profesor1@ucp.edu.ar');
    remitente2 = new Contacto('Profesor Dos', 'profesor2@ucp.edu.ar');
    destinatario = new Contacto('Alumno', 'alumno@ucp.edu.ar');

    correo1 = new Correo({
      id: 'e1',
      asunto: 'Tema 1',
      cuerpo: 'Contenido 1',
      remitente: remitente1,
      destinatarios: [destinatario],
    });

    correo2 = new Correo({
      id: 'e2',
      asunto: 'Tema 2',
      cuerpo: 'Contenido 2',
      remitente: remitente1,
      destinatarios: [destinatario],
    });

    correo3 = new Correo({
      id: 'e3',
      asunto: 'Tema 3',
      cuerpo: 'Contenido 3',
      remitente: remitente2,
      destinatarios: [destinatario],
    });

    // Marcamos correo2 como leido
    correo2.marcarComoLeido();

    correos = [correo1, correo2, correo3];
  });

  describe('Funciones puras de Estadisticas', () => {
    it('obtenerAsuntos deberia extraer los asuntos usando map', () => {
      const asuntos = obtenerAsuntos(correos);
      expect(asuntos).toEqual(['Tema 1', 'Tema 2', 'Tema 3']);
    });

    it('obtenerAsuntos deberia devolver array vacio para coleccion vacia', () => {
      expect(obtenerAsuntos([])).toEqual([]);
    });

    it('filtrarPor deberia retornar elementos que cumplen el predicado usando filter', () => {
      const leidos = filtrarPor(correos, (c) => c.leido);
      expect(leidos).toHaveLength(1);
      expect(leidos[0].id).toBe('e2');
    });

    it('contarNoLeidos deberia contar correos no leidos usando reduce', () => {
      // correo1 y correo3 no leidos, correo2 leido
      const cantidad = contarNoLeidos(correos);
      expect(cantidad).toBe(2);
    });

    it('contarNoLeidos deberia devolver 0 para coleccion vacia', () => {
      expect(contarNoLeidos([])).toBe(0);
    });

    it('contarPorRemitente deberia agrupar cantidades por correo de remitente usando reduce', () => {
      const mapa = contarPorRemitente(correos);
      expect(mapa.get('profesor1@ucp.edu.ar')).toBe(2);
      expect(mapa.get('profesor2@ucp.edu.ar')).toBe(1);
      expect(mapa.size).toBe(2);
    });

    it('porcentajeLeidos deberia calcular el porcentaje de correos leidos', () => {
      // 1 de 3 leido = 33.33%
      expect(porcentajeLeidos(correos)).toBe(33.33);

      correo1.marcarComoLeido();
      // 2 de 3 leidos = 66.67%
      expect(porcentajeLeidos(correos)).toBe(66.67);

      correo3.marcarComoLeido();
      // 3 de 3 leidos = 100%
      expect(porcentajeLeidos(correos)).toBe(100);
    });

    it('porcentajeLeidos deberia retornar 0 si la coleccion esta vacia', () => {
      expect(porcentajeLeidos([])).toBe(0);
    });

    it('no deberia mutar la coleccion de entrada', () => {
      const copiaOriginal = [...correos];
      obtenerAsuntos(correos);
      contarNoLeidos(correos);
      contarPorRemitente(correos);
      porcentajeLeidos(correos);

      expect(correos).toEqual(copiaOriginal);
    });
  });

  describe('Integracion con GestorCorreos', () => {
    it('obtenerAsuntos deberia extraer los asuntos de la bandeja indicada', () => {
      const gestor = new GestorCorreos();
      gestor.recibir(correo1);
      gestor.recibir(correo2);

      const asuntos = gestor.obtenerAsuntos(TipoBandeja.ENTRADA);
      expect(asuntos).toEqual(['Tema 1', 'Tema 2']);
    });

    it('obtenerEstadisticas deberia devolver metricas consolidadas de la bandeja', () => {
      const gestor = new GestorCorreos();
      gestor.recibir(correo1);
      gestor.recibir(correo2);
      gestor.recibir(correo3);

      const stats = gestor.obtenerEstadisticas(TipoBandeja.ENTRADA);
      expect(stats.total).toBe(3);
      expect(stats.noLeidos).toBe(2);
      expect(stats.porcentajeLeidos).toBe(33.33);
      expect(stats.porRemitente.get('profesor1@ucp.edu.ar')).toBe(2);
    });
  });
});
