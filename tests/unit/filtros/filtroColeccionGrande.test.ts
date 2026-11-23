/**
 * Test de filtros sobre una coleccion grande de 100 correos.
 *
 * Distribucion de los 100 correos:
 *   - Cada 3 correos (indices 0, 3, 6, ...) el remitente es del dominio "ucp.edu.ar"  → 34 correos
 *   - Cada 5 correos (indices 0, 5, 10, ...) el asunto contiene "Examen"              → 20 correos
 *   - Interseccion (multiplos de 15: 0, 15, 30...): UCP Y Examen                      → 7 correos
 *   - Union: UCP O Examen                                                              → 47 correos
 *   - UCP sin Examen (AND NOT)                                                         → 27 correos
 *
 * Verifica ademas:
 *   - Reutilizacion del filtro en distintas porciones de la coleccion
 *   - Comportamiento dinamico: marcar/desmarcar leido afecta resultados del filtro
 *   - Aplicar un filtro no muta la coleccion original
 */

import { Correo } from '../../../src/domain/models/Correo';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Filtro } from '../../../src/domain/filtros/Filtro';
import { and, not, or } from '../../../src/domain/filtros/Predicados';
import {
  asuntoContiene,
  estaLeido,
  remitenteConDominio,
} from '../../../src/domain/filtros/PredicadosCorreo';

// ---------------------------------------------------------------------------
// Helpers de construccion
// ---------------------------------------------------------------------------

const remitenteUcp = new Contacto('Profesor UCP', 'profesor@ucp.edu.ar');
const remitenteOtro = new Contacto('Alumno Otro', 'alumno@gmail.com');
const destinatario = new Contacto('Estudiante', 'estudiante@ucp.edu.ar');

function crearCorreo(indice: number): Correo {
  const esUcp = indice % 3 === 0;
  const esExamen = indice % 5 === 0;

  return new Correo({
    id: `correo-${indice}`,
    asunto: esExamen ? `Examen parcial ${indice}` : `Comunicado ${indice}`,
    cuerpo: 'Contenido del correo.',
    remitente: esUcp ? remitenteUcp : remitenteOtro,
    destinatarios: [destinatario],
  });
}

// Coleccion base: 100 correos, todos sin leer
function crearColeccion(): Correo[] {
  return Array.from({ length: 100 }, (_, i) => crearCorreo(i));
}

// ---------------------------------------------------------------------------
// Suite principal
// ---------------------------------------------------------------------------

describe('Filtros sobre una coleccion de 100 correos', () => {
  let correos: Correo[];

  beforeEach(() => {
    correos = crearColeccion();
  });

  // -------------------------------------------------------------------------
  // Conteos basicos
  // -------------------------------------------------------------------------

  describe('conteos basicos de la coleccion', () => {
    it('la coleccion tiene exactamente 100 correos', () => {
      expect(correos).toHaveLength(100);
    });

    it('34 correos son del dominio ucp.edu.ar (multiplos de 3: 0..99)', () => {
      // Multiplos de 3 de 0 a 99: floor(99/3) + 1 = 34
      const cantidad = correos.filter((c) => c.id.match(/^correo-\d+$/) && parseInt(c.id.split('-')[1]) % 3 === 0).length;
      expect(cantidad).toBe(34);
    });

    it('20 correos tienen "Examen" en el asunto (multiplos de 5: 0..99)', () => {
      // Multiplos de 5 de 0 a 99: floor(99/5) + 1 = 20
      const cantidad = correos.filter((c) => c.asunto.toLowerCase().includes('examen')).length;
      expect(cantidad).toBe(20);
    });
  });

  // -------------------------------------------------------------------------
  // Filtro simple
  // -------------------------------------------------------------------------

  describe('Filtro simple: remitente del dominio ucp.edu.ar', () => {
    it('devuelve 34 correos con remitenteConDominio', () => {
      const filtro = new Filtro('UCP', remitenteConDominio('ucp.edu.ar'));
      expect(filtro.aplicar(correos)).toHaveLength(34);
    });

    it('puede reutilizarse sobre distintas porciones de la coleccion', () => {
      const filtro = new Filtro('UCP', remitenteConDominio('ucp.edu.ar'));

      const primeraMitad = correos.slice(0, 50);
      const segundaMitad = correos.slice(50);

      // Multiplos de 3 de 0..49: 0,3,6,...,48 → 17
      // Multiplos de 3 de 50..99: 51,54,...,99 → 17
      expect(filtro.aplicar(primeraMitad)).toHaveLength(17);
      expect(filtro.aplicar(segundaMitad)).toHaveLength(17);

      // Suma igual al total
      expect(filtro.aplicar(primeraMitad).length + filtro.aplicar(segundaMitad).length).toBe(34);
    });
  });

  // -------------------------------------------------------------------------
  // Filtros compuestos (AND, OR, NOT)
  // -------------------------------------------------------------------------

  describe('Filtros compuestos', () => {
    it('AND: UCP y Examen devuelve 7 correos (multiplos de 15)', () => {
      // Multiplos de lcm(3,5)=15 de 0..99: 0,15,30,45,60,75,90 → 7
      const filtro = new Filtro(
        'UCP y Examen',
        and(remitenteConDominio('ucp.edu.ar'), asuntoContiene('Examen'))
      );
      expect(filtro.aplicar(correos)).toHaveLength(7);
    });

    it('OR: UCP o Examen devuelve 47 correos (union de ambos conjuntos)', () => {
      // |UCP| + |Examen| - |UCP∩Examen| = 34 + 20 - 7 = 47
      const filtro = new Filtro(
        'UCP o Examen',
        or(remitenteConDominio('ucp.edu.ar'), asuntoContiene('Examen'))
      );
      expect(filtro.aplicar(correos)).toHaveLength(47);
    });

    it('AND NOT: UCP sin Examen devuelve 27 correos', () => {
      // |UCP| - |UCP∩Examen| = 34 - 7 = 27
      const filtro = new Filtro(
        'UCP sin Examen',
        and(remitenteConDominio('ucp.edu.ar'), not(asuntoContiene('Examen')))
      );
      expect(filtro.aplicar(correos)).toHaveLength(27);
    });

    it('NOT: correos que no son de UCP devuelve 66', () => {
      // 100 - 34 = 66
      const filtro = new Filtro('No UCP', not(remitenteConDominio('ucp.edu.ar')));
      expect(filtro.aplicar(correos)).toHaveLength(66);
    });
  });

  // -------------------------------------------------------------------------
  // Comportamiento dinamico: marcar como leido afecta los resultados
  // -------------------------------------------------------------------------

  describe('comportamiento dinamico: marcar correos como leido', () => {
    it('marcar correos como leidos reduce el conteo de no leidos en el filtro', () => {
      const filtroNoLeidos = new Filtro('No leidos', not(estaLeido));

      // Al inicio todos estan sin leer
      expect(filtroNoLeidos.aplicar(correos)).toHaveLength(100);

      // Marcar los primeros 10 correos como leidos
      correos.slice(0, 10).forEach((c) => c.marcarComoLeido());

      expect(filtroNoLeidos.aplicar(correos)).toHaveLength(90);
    });

    it('desmarcar como leido restaura el correo al conjunto de no leidos', () => {
      const filtroNoLeidos = new Filtro('No leidos', not(estaLeido));

      correos[0].marcarComoLeido();
      expect(filtroNoLeidos.aplicar(correos)).toHaveLength(99);

      correos[0].marcarComoNoLeido();
      expect(filtroNoLeidos.aplicar(correos)).toHaveLength(100);
    });

    it('combinar: UCP no leidos disminuye al marcar como leidos correos de UCP', () => {
      const filtroUcpNoLeidos = new Filtro(
        'UCP no leidos',
        and(remitenteConDominio('ucp.edu.ar'), not(estaLeido))
      );

      expect(filtroUcpNoLeidos.aplicar(correos)).toHaveLength(34);

      // Marcar los primeros 5 correos de UCP como leidos
      const ucpCorreos = correos.filter((c) => c.remitente.correo.endsWith('@ucp.edu.ar'));
      ucpCorreos.slice(0, 5).forEach((c) => c.marcarComoLeido());

      expect(filtroUcpNoLeidos.aplicar(correos)).toHaveLength(29);
    });
  });

  // -------------------------------------------------------------------------
  // Inmutabilidad: aplicar el filtro no muta la coleccion original
  // -------------------------------------------------------------------------

  describe('aplicar un filtro no muta la coleccion original', () => {
    it('la coleccion conserva 100 elementos despues de aplicar cualquier filtro', () => {
      const filtro = new Filtro('UCP', remitenteConDominio('ucp.edu.ar'));
      filtro.aplicar(correos);
      expect(correos).toHaveLength(100);
    });

    it('ningun correo cambia su estado leido al aplicar el filtro', () => {
      const filtro = new Filtro('No leidos', not(estaLeido));
      filtro.aplicar(correos);
      const sigueHabiendo100NoLeidos = correos.every((c) => !c.leido);
      expect(sigueHabiendo100NoLeidos).toBe(true);
    });

    it('el array devuelto por aplicar es independiente de la coleccion original', () => {
      const filtro = new Filtro('UCP', remitenteConDominio('ucp.edu.ar'));
      const resultado = filtro.aplicar(correos);

      // Modificar el resultado no afecta la coleccion original
      resultado.splice(0, resultado.length);
      expect(correos).toHaveLength(100);
    });
  });
});
