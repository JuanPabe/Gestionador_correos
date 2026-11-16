import { Correo } from '../domain/models/Correo';
import { Predicado } from '../domain/filtros/Predicados';

// 1. Extrae los asuntos de una coleccion utilizando map funcional (RF-10)
export const obtenerAsuntos = (correos: ReadonlyArray<Correo>): string[] =>
  correos.map((correo) => correo.asunto);

// 2. Filtra correos que cumplan una condicion dada utilizando filter funcional (RF-10)
export const filtrarPor = (
  correos: ReadonlyArray<Correo>,
  predicado: Predicado
): Correo[] => correos.filter(predicado);

// 3. Cuenta correos no leidos utilizando reduce funcional (RF-10)
export const contarNoLeidos = (correos: ReadonlyArray<Correo>): number =>
  correos.reduce((total, correo) => total + (correo.leido ? 0 : 1), 0);

// 4. Agrupa y cuenta correos por direccion de remitente utilizando reduce funcional (RF-10)
export const contarPorRemitente = (
  correos: ReadonlyArray<Correo>
): Map<string, number> =>
  correos.reduce((mapa, correo) => {
    const clave = correo.remitente.correo.toLowerCase();
    const actual = mapa.get(clave) ?? 0;
    mapa.set(clave, actual + 1);
    return mapa;
  }, new Map<string, number>());

// 5. Calcula el porcentaje de correos leidos con precision de 2 decimales utilizando reduce funcional (RF-10)
export const porcentajeLeidos = (correos: ReadonlyArray<Correo>): number => {
  if (correos.length === 0) {
    return 0;
  }
  const leidos = correos.reduce(
    (acumulado, correo) => acumulado + (correo.leido ? 1 : 0),
    0
  );
  const porcentaje = (leidos / correos.length) * 100;
  return Number(porcentaje.toFixed(2));
};

export interface ResumenEstadisticas {
  total: number;
  noLeidos: number;
  porcentajeLeidos: number;
  porRemitente: Map<string, number>;
}
