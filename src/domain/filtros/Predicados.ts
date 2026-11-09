import { Correo } from '../models/Correo';

export type Predicado = (correo: Correo) => boolean;

export const and =
  (...predicados: Predicado[]): Predicado =>
  (correo) =>
    predicados.every((p) => p(correo));

export const or =
  (...predicados: Predicado[]): Predicado =>
  (correo) =>
    predicados.some((p) => p(correo));

export const not =
  (predicado: Predicado): Predicado =>
  (correo) =>
    !predicado(correo);