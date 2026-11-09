import { describe, it, expect } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Correo } from '../../../src/domain/models/Correo';
import { Filtro } from '../../../src/domain/filtros/Filtro';
import { and, not } from '../../../src/domain/filtros/Predicados';
import { asuntoContiene, estaLeido } from '../../../src/domain/filtros/PredicadosCorreo';

const crearCorreo = (id: string, asunto: string, leido = false): Correo =>
  new Correo({
    id,
    asunto,
    cuerpo: 'Contenido',
    remitente: new Contacto('Ana', 'ana@ucp.edu.ar'),
    destinatarios: [new Contacto('Beto', 'beto@mail.com')],
    leido,
  });

describe('Filtro', () => {
  it('rechaza un nombre vacío', () => {
    expect(() => new Filtro('   ', estaLeido)).toThrow();
  });

  it('conserva su nombre sin espacios sobrantes', () => {
    expect(new Filtro('  Pendientes  ', estaLeido).nombre).toBe('Pendientes');
  });

  it('devuelve solo los correos que cumplen la condición', () => {
    const filtro = new Filtro('Exámenes sin leer', and(asuntoContiene('examen'), not(estaLeido)));
    const c1 = crearCorreo('1', 'Examen final');
    const c2 = crearCorreo('2', 'Examen parcial', true);
    const c3 = crearCorreo('3', 'Hola');

    expect(filtro.aplicar([c1, c2, c3])).toEqual([c1]);
  });

  it('devuelve una colección vacía si no hay coincidencias o la bandeja está vacía', () => {
    const filtro = new Filtro('Exámenes', asuntoContiene('examen'));
    expect(filtro.aplicar([crearCorreo('1', 'Hola')])).toEqual([]);
    expect(filtro.aplicar([])).toEqual([]);
  });

  it('no modifica la colección original ni los correos', () => {
    const filtro = new Filtro('Sin leer', not(estaLeido));
    const correos = [crearCorreo('1', 'A'), crearCorreo('2', 'B', true)];

    filtro.aplicar(correos);

    expect(correos).toHaveLength(2);
    expect(correos[0].leido).toBe(false);
    expect(correos[1].leido).toBe(true);
  });

  it('puede reutilizarse sobre distintas colecciones', () => {
    const filtro = new Filtro('Exámenes', asuntoContiene('examen'));
    const entrada = [crearCorreo('1', 'Examen A'), crearCorreo('2', 'Hola')];
    const enviados = [crearCorreo('3', 'Re: examen B')];

    expect(filtro.aplicar(entrada)).toHaveLength(1);
    expect(filtro.aplicar(enviados)).toHaveLength(1);
  });

  it('refleja los cambios de los correos sin volver a almacenarlos', () => {
    const filtro = new Filtro('Sin leer', not(estaLeido));
    const correo = crearCorreo('1', 'Hola');

    expect(filtro.aplicar([correo])).toHaveLength(1);
    correo.marcarComoLeido();
    expect(filtro.aplicar([correo])).toHaveLength(0);
  });
});