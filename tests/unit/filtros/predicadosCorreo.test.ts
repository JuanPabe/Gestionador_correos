import { describe, it, expect } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Correo } from '../../../src/domain/models/Correo';
import {
  remitenteConDominio,
  remitenteEs,
  asuntoContiene,
  contenidoContiene,
  estaLeido,
  esFavorito,
} from '../../../src/domain/filtros/PredicadosCorreo';

interface Opciones {
  asunto?: string;
  cuerpo?: string;
  remitente?: string;
  leido?: boolean;
  favorito?: boolean;
}

const crearCorreo = (opciones: Opciones = {}): Correo =>
  new Correo({
    id: 'c1',
    asunto: opciones.asunto ?? 'Asunto',
    cuerpo: opciones.cuerpo ?? 'Cuerpo',
    remitente: new Contacto('Remitente', opciones.remitente ?? 'remitente@mail.com'),
    destinatarios: [new Contacto('Destinatario', 'dest@mail.com')],
    leido: opciones.leido,
    favorito: opciones.favorito,
  });

describe('Predicados concretos de correo', () => {
  it('remitenteConDominio acepta correos del dominio sin distinguir mayúsculas', () => {
    const predicado = remitenteConDominio('UCP.EDU.AR');
    expect(predicado(crearCorreo({ remitente: 'ana@ucp.edu.ar' }))).toBe(true);
  });

  it('remitenteConDominio rechaza otros dominios y dominios parecidos', () => {
    const predicado = remitenteConDominio('ucp.edu.ar');
    expect(predicado(crearCorreo({ remitente: 'ana@gmail.com' }))).toBe(false);
    expect(predicado(crearCorreo({ remitente: 'ana@falsoucp.edu.ar' }))).toBe(false);
  });

  it('remitenteEs compara la dirección exacta sin distinguir mayúsculas', () => {
    const predicado = remitenteEs('Ana@UCP.edu.ar');
    expect(predicado(crearCorreo({ remitente: 'ana@ucp.edu.ar' }))).toBe(true);
    expect(predicado(crearCorreo({ remitente: 'beto@ucp.edu.ar' }))).toBe(false);
  });

  it('asuntoContiene admite coincidencias parciales sin distinguir mayúsculas', () => {
    const predicado = asuntoContiene('examen');
    expect(predicado(crearCorreo({ asunto: 'Fecha del EXAMEN final' }))).toBe(true);
    expect(predicado(crearCorreo({ asunto: 'Hola' }))).toBe(false);
  });

  it('contenidoContiene admite coincidencias parciales sin distinguir mayúsculas', () => {
    const predicado = contenidoContiene('entrega');
    expect(predicado(crearCorreo({ cuerpo: 'Recuerden la ENTREGA del lunes' }))).toBe(true);
    expect(predicado(crearCorreo({ cuerpo: 'Sin novedades' }))).toBe(false);
  });

  it('estaLeido refleja el estado de lectura del correo', () => {
    expect(estaLeido(crearCorreo({ leido: true }))).toBe(true);
    expect(estaLeido(crearCorreo({ leido: false }))).toBe(false);
  });

  it('esFavorito refleja el indicador de favorito del correo', () => {
    expect(esFavorito(crearCorreo({ favorito: true }))).toBe(true);
    expect(esFavorito(crearCorreo({ favorito: false }))).toBe(false);
  });
});