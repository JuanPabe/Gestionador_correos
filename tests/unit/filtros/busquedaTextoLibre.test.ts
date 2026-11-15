import { describe, it, expect, beforeEach } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Correo } from '../../../src/domain/models/Correo';
import { GestorCorreos } from '../../../src/servicios/GestorCorreos';
import {
  remitenteContiene,
  destinatarioContiene,
  textoLibreContiene,
} from '../../../src/domain/filtros/PredicadosCorreo';

describe('Busqueda Libre Funcional en Entrada (RF-04 / T4)', () => {
  let gestor: GestorCorreos;
  let profesor: Contacto;
  let alumno1: Contacto;
  let alumno2: Contacto;
  let correo1: Correo;
  let correo2: Correo;
  let correo3: Correo;

  beforeEach(() => {
    gestor = new GestorCorreos();
    profesor = new Contacto('Carlos Martinez', 'carlos@ucp.edu.ar');
    alumno1 = new Contacto('Juan Perez', 'juan@ucp.edu.ar');
    alumno2 = new Contacto('Maria Gomez', 'maria@gmail.com');
    const decano = new Contacto('Roberto Decano', 'decano@ucp.edu.ar');

    correo1 = new Correo({
      id: 'c1',
      asunto: 'Notas del Examen Final',
      cuerpo: 'Las notas ya estan en el campus virtual',
      remitente: profesor,
      destinatarios: [alumno1],
    });

    correo2 = new Correo({
      id: 'c2',
      asunto: 'Convocatoria Reunion',
      cuerpo: 'Reunion del comite academico',
      remitente: decano,
      destinatarios: [alumno1],
    });

    correo3 = new Correo({
      id: 'c3',
      asunto: 'TP Integrador',
      cuerpo: 'Recordatorio entrega del proyecto',
      remitente: profesor,
      destinatarios: [alumno2],
    });

    gestor.recibir(correo1);
    gestor.recibir(correo2);
    gestor.recibir(correo3);
  });

  describe('Predicados individuales de busqueda', () => {
    it('remitenteContiene deberia encontrar por nombre o por correo del remitente', () => {
      const predNombre = remitenteContiene('Martinez');
      const predCorreo = remitenteContiene('carlos@ucp');

      expect(predNombre(correo1)).toBe(true);
      expect(predCorreo(correo1)).toBe(true);
      expect(predNombre(correo2)).toBe(false);
    });

    it('destinatarioContiene deberia encontrar por nombre o email de cualquier destinatario', () => {
      const predNombre = destinatarioContiene('Perez');
      const predCorreo = destinatarioContiene('gmail.com');

      expect(predNombre(correo1)).toBe(true);
      expect(predNombre(correo2)).toBe(true);
      expect(predCorreo(correo3)).toBe(true);
      expect(predCorreo(correo1)).toBe(false);
    });

    it('textoLibreContiene deberia combinar asunto, cuerpo, remitente y destinatarios', () => {
      const predAsunto = textoLibreContiene('Examen');
      const predCuerpo = textoLibreContiene('campus virtual');
      const predRemitente = textoLibreContiene('Carlos');
      const predDestinatario = textoLibreContiene('Maria');

      expect(predAsunto(correo1)).toBe(true);
      expect(predCuerpo(correo1)).toBe(true);
      expect(predRemitente(correo1)).toBe(true);
      expect(predDestinatario(correo3)).toBe(true);
    });
  });

  describe('GestorCorreos.buscar en Bandeja de Entrada', () => {
    it('deberia encontrar correos por coincidencia parcial en el asunto', () => {
      const res = gestor.buscar('examen');
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('c1');
    });

    it('deberia encontrar correos por coincidencia parcial en el cuerpo', () => {
      const res = gestor.buscar('campus');
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('c1');
    });

    it('deberia encontrar correos por nombre o email del remitente', () => {
      const res = gestor.buscar('Martinez');
      expect(res).toHaveLength(2); // c1 y c3
    });

    it('deberia encontrar correos por nombre o email de los destinatarios', () => {
      const res = gestor.buscar('Gomez');
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('c3');
    });

    it('deberia ser insensible a mayusculas y minusculas', () => {
      const res = gestor.buscar('EXAMEN');
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('c1');
    });

    it('un correo debe aparecer una sola vez aunque coincida en varios campos', () => {
      // Carlos aparece en nombre y correo del remitente de c1
      const res = gestor.buscar('carlos');
      expect(res).toHaveLength(2); // c1 y c3 (en c2 es destinatario pero no se repite dos veces en c1)
      const ids = res.map((c) => c.id);
      expect(ids).toEqual([...new Set(ids)]);
    });

    it('deberia devolver array vacio si no hay coincidencias', () => {
      const res = gestor.buscar('inexistenteXYZ');
      expect(res).toEqual([]);
    });

    it('deberia devolver array vacio si el texto de busqueda esta vacio o con solo espacios', () => {
      expect(gestor.buscar('')).toEqual([]);
      expect(gestor.buscar('   ')).toEqual([]);
    });

    it('deberia devolver array vacio si la bandeja de entrada esta vacia', () => {
      const gestorVacio = new GestorCorreos();
      expect(gestorVacio.buscar('examen')).toEqual([]);
    });

    it('no deberia modificar los correos originales ni la coleccion original', () => {
      const res = gestor.buscar('Examen') as Correo[];
      expect(res).toHaveLength(1);
      res.pop();
      expect(gestor.obtenerBandeja(gestor.obtenerUbicacion('c1')!)).toHaveLength(3);
    });
  });
});
