import { Filtro } from './Filtro';
import { and, or, not } from './Predicados';
import {
  remitenteConDominio,
  remitenteEs,
  asuntoContiene,
  contenidoContiene,
  estaLeido,
  esFavorito,
} from './PredicadosCorreo';

// 1. Correos de la UCP: remitente perteneciente al dominio @ucp.edu.ar (Simple)
export const crearFiltroUCP = (): Filtro =>
  new Filtro('Correos de la UCP', remitenteConDominio('ucp.edu.ar'));

// 2. Correos academicos importantes: dominio @ucp.edu.ar y asunto contenga "Examen" (Complejo: AND)
export const crearFiltroAcademicosImportantes = (): Filtro =>
  new Filtro(
    'Correos academicos importantes',
    and(remitenteConDominio('ucp.edu.ar'), asuntoContiene('Examen'))
  );

// 3. Pendientes de revision: mensajes no leidos cuyo contenido incluya "Entrega" (Complejo: AND + NOT)
export const crearFiltroPendientesRevision = (): Filtro =>
  new Filtro(
    'Pendientes de revision',
    and(not(estaLeido), contenidoContiene('Entrega'))
  );

// 4. Correos personales prioritarios: marcados como favoritos y de remitente determinado (Complejo: AND)
export const crearFiltroPersonalesPrioritarios = (direccionRemitente: string): Filtro =>
  new Filtro(
    'Correos personales prioritarios',
    and(esFavorito, remitenteEs(direccionRemitente))
  );

// 5. Correos para seguimiento: asunto con "Proyecto" o "Reunion", y no leidos (Complejo: AND + OR + NOT)
export const crearFiltroSeguimiento = (): Filtro =>
  new Filtro(
    'Correos para seguimiento',
    and(or(asuntoContiene('Proyecto'), asuntoContiene('Reunion')), not(estaLeido))
  );
