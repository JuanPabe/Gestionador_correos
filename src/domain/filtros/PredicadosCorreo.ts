import { Predicado } from './Predicados';

export const remitenteConDominio = (dominio: string): Predicado => {
  const sufijo = '@' + dominio.trim().toLowerCase();
  return (correo) => correo.remitente.correo.endsWith(sufijo);
};

export const remitenteEs = (direccion: string): Predicado => {
  const buscada = direccion.trim().toLowerCase();
  return (correo) => correo.remitente.correo === buscada;
};

export const asuntoContiene = (texto: string): Predicado => {
  const buscado = texto.toLowerCase();
  return (correo) => correo.asunto.toLowerCase().includes(buscado);
};

export const contenidoContiene = (texto: string): Predicado => {
  const buscado = texto.toLowerCase();
  return (correo) => correo.cuerpo.toLowerCase().includes(buscado);
};

export const estaLeido: Predicado = (correo) => correo.leido;

export const esFavorito: Predicado = (correo) => correo.favorito;