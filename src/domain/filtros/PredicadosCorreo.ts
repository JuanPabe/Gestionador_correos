import { Predicado, or } from './Predicados';

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

// Predicado funcional para coincidencias parciales case-insensitive en remitente (RF-04)
export const remitenteContiene = (texto: string): Predicado => {
  const buscado = texto.trim().toLowerCase();
  if (buscado.length === 0) return () => false;
  return (correo) =>
    correo.remitente.nombre.toLowerCase().includes(buscado) ||
    correo.remitente.correo.toLowerCase().includes(buscado);
};

// Predicado funcional para coincidencias parciales case-insensitive en destinatarios (RF-04)
export const destinatarioContiene = (texto: string): Predicado => {
  const buscado = texto.trim().toLowerCase();
  if (buscado.length === 0) return () => false;
  return (correo) =>
    correo.destinatarios.some(
      (d) =>
        d.nombre.toLowerCase().includes(buscado) ||
        d.correo.toLowerCase().includes(buscado)
    );
};

// Predicado compuesto que une con OR logico la coincidencia en cualquier campo textual (RF-04)
export const textoLibreContiene = (texto: string): Predicado => {
  const buscado = texto.trim().toLowerCase();
  if (buscado.length === 0) return () => false;
  return or(
    asuntoContiene(buscado),
    contenidoContiene(buscado),
    remitenteContiene(buscado),
    destinatarioContiene(buscado)
  );
};
