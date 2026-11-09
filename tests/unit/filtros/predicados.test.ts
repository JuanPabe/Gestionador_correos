import { describe, it, expect } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Correo } from '../../../src/domain/models/Correo';
import { Predicado, and, or, not } from '../../../src/domain/filtros/Predicados';

const crearCorreo = (id: string, asunto: string, leido = false): Correo =>
  new Correo({
    id,
    asunto,
    cuerpo: 'Contenido',
    remitente: new Contacto('Ana', 'ana@ucp.edu.ar'),
    destinatarios: [new Contacto('Beto', 'beto@mail.com')],
    leido,
  });

const esLeido: Predicado = (c) => c.leido;
const asuntoConExamen: Predicado = (c) => c.asunto.includes('Examen');

describe('Predicados', () => {
  it('not invierte el resultado del predicado', () => {
    expect(not(esLeido)(crearCorreo('1', 'Hola', true))).toBe(false);
    expect(not(esLeido)(crearCorreo('2', 'Hola', false))).toBe(true);
  });

  it('and exige que se cumplan todos los predicados', () => {
    const noLeidoConExamen = and(not(esLeido), asuntoConExamen);
    expect(noLeidoConExamen(crearCorreo('1', 'Examen final'))).toBe(true);
    expect(noLeidoConExamen(crearCorreo('2', 'Examen final', true))).toBe(false);
    expect(noLeidoConExamen(crearCorreo('3', 'Hola'))).toBe(false);
  });

  it('or exige que se cumpla al menos uno', () => {
    const leidoOExamen = or(esLeido, asuntoConExamen);
    expect(leidoOExamen(crearCorreo('1', 'Examen', false))).toBe(true);
    expect(leidoOExamen(crearCorreo('2', 'Hola', true))).toBe(true);
    expect(leidoOExamen(crearCorreo('3', 'Hola', false))).toBe(false);
  });

  it('permite reutilizar predicados compuestos para armar otros nuevos', () => {
    const base = and(not(esLeido), asuntoConExamen);
    const compuesto = or(base, esLeido);
    expect(compuesto(crearCorreo('1', 'Examen'))).toBe(true);
    expect(compuesto(crearCorreo('2', 'Hola', true))).toBe(true);
    expect(compuesto(crearCorreo('3', 'Hola'))).toBe(false);
  });
});