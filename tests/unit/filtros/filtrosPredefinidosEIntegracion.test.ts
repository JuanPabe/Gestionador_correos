import { describe, it, expect, beforeEach } from 'vitest';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Correo } from '../../../src/domain/models/Correo';
import { TipoBandeja } from '../../../src/domain/bandejas/Bandeja';
import { GestorCorreos } from '../../../src/servicios/GestorCorreos';
import { Filtro } from '../../../src/domain/filtros/Filtro';
import {
  crearFiltroUCP,
  crearFiltroAcademicosImportantes,
  crearFiltroPendientesRevision,
  crearFiltroPersonalesPrioritarios,
  crearFiltroSeguimiento,
} from '../../../src/domain/filtros/FiltrosPredefinidos';

describe('Filtros Predefinidos e Integracion con GestorCorreos (RF-05, RF-08, RF-09 / T5)', () => {
  let gestor: GestorCorreos;
  let remitenteUcp: Contacto;
  let remitenteExterno: Contacto;
  let alumno: Contacto;

  let correoUcpExamen: Correo;
  let correoUcpOtro: Correo;
  let correoExternoEntrega: Correo;
  let correoSeguimientoProyecto: Correo;
  let correoSeguimientoReunion: Correo;

  beforeEach(() => {
    gestor = new GestorCorreos();
    remitenteUcp = new Contacto('Profesor UCP', 'profesor@ucp.edu.ar');
    remitenteExterno = new Contacto('Contacto Externo', 'amigo@gmail.com');
    alumno = new Contacto('Alumno', 'alumno@ucp.edu.ar');

    correoUcpExamen = new Correo({
      id: 'f1',
      asunto: 'Instrucciones para el Examen',
      cuerpo: 'El aula asignada es la 402',
      remitente: remitenteUcp,
      destinatarios: [alumno],
    });

    correoUcpOtro = new Correo({
      id: 'f2',
      asunto: 'Aviso administrativo',
      cuerpo: 'Horarios de atencion',
      remitente: remitenteUcp,
      destinatarios: [alumno],
    });

    correoExternoEntrega = new Correo({
      id: 'f3',
      asunto: 'Trabajo practico',
      cuerpo: 'Confirmar recepcion de la Entrega final',
      remitente: remitenteExterno,
      destinatarios: [alumno],
    });

    correoSeguimientoProyecto = new Correo({
      id: 'f4',
      asunto: 'Avance del Proyecto Anual',
      cuerpo: 'Revisar tareas pendientes',
      remitente: new Contacto('Colega', 'colega@empresa.com'),
      destinatarios: [alumno],
    });

    correoSeguimientoReunion = new Correo({
      id: 'f5',
      asunto: 'Coordinar Reunion de equipo',
      cuerpo: 'Horario tentativo lunes 18hs',
      remitente: remitenteUcp,
      destinatarios: [alumno],
    });

    gestor.recibir(correoUcpExamen);
    gestor.recibir(correoUcpOtro);
    gestor.recibir(correoExternoEntrega);
    gestor.recibir(correoSeguimientoProyecto);
    gestor.recibir(correoSeguimientoReunion);
  });

  describe('Los 5 Filtros Predefinidos de la consigna', () => {
    it('1. Correos de la UCP deberia filtrar solo remitentes con dominio @ucp.edu.ar', () => {
      const filtro = crearFiltroUCP();
      const todos = [correoUcpExamen, correoUcpOtro, correoExternoEntrega];
      const res = filtro.aplicar(todos);

      expect(res).toHaveLength(2);
      expect(res).toContain(correoUcpExamen);
      expect(res).toContain(correoUcpOtro);
      expect(res).not.toContain(correoExternoEntrega);
    });

    it('2. Correos academicos importantes deberia exigir dominio @ucp.edu.ar Y asunto con Examen', () => {
      const filtro = crearFiltroAcademicosImportantes();
      const todos = [correoUcpExamen, correoUcpOtro, correoExternoEntrega];
      const res = filtro.aplicar(todos);

      expect(res).toHaveLength(1);
      expect(res[0]).toBe(correoUcpExamen);
    });

    it('3. Pendientes de revision deberia filtrar correos NO leidos cuyo contenido contenga Entrega', () => {
      const filtro = crearFiltroPendientesRevision();
      const todos = [correoUcpExamen, correoExternoEntrega];
      expect(filtro.aplicar(todos)).toHaveLength(1);

      // Si se marca como leido, dinamismo: ya no debe ser devuelto sin necesidad de re-guardar
      correoExternoEntrega.marcarComoLeido();
      expect(filtro.aplicar(todos)).toHaveLength(0);
    });

    it('4. Correos personales prioritarios deberia filtrar favoritos de un remitente determinado', () => {
      const filtro = crearFiltroPersonalesPrioritarios('amigo@gmail.com');
      const todos = [correoExternoEntrega, correoSeguimientoProyecto];

      expect(filtro.aplicar(todos)).toHaveLength(0); // Todavia no son favoritos

      correoExternoEntrega.marcarComoFavorito();
      correoSeguimientoProyecto.marcarComoFavorito();

      const res = filtro.aplicar(todos);
      expect(res).toHaveLength(1);
      expect(res[0]).toBe(correoExternoEntrega);
    });

    it('5. Correos para seguimiento deberia filtrar asunto con Proyecto O Reunion, excluyendo los leidos', () => {
      const filtro = crearFiltroSeguimiento();
      const todos = [correoSeguimientoProyecto, correoSeguimientoReunion, correoUcpOtro];
      const resInicial = filtro.aplicar(todos);

      expect(resInicial).toHaveLength(2);
      expect(resInicial).toContain(correoSeguimientoProyecto);
      expect(resInicial).toContain(correoSeguimientoReunion);

      // Si uno se lee, dinamismo: se excluye inmediatamente
      correoSeguimientoProyecto.marcarComoLeido();
      const resActualizada = filtro.aplicar(todos);
      expect(resActualizada).toHaveLength(1);
      expect(resActualizada[0]).toBe(correoSeguimientoReunion);
    });
  });

  describe('Integracion de Filtros con GestorCorreos', () => {
    it('deberia permitir registrar filtros y consultar en cualquier bandeja fisica', () => {
      const filtroUcp = crearFiltroUCP();
      gestor.registrarFiltro(filtroUcp);

      const resultadosEntrada = gestor.aplicarFiltro('Correos de la UCP', TipoBandeja.ENTRADA);
      expect(resultadosEntrada).toHaveLength(3); // c1, c2, c5
    });

    it('el mismo filtro debe poder reutilizarse sobre distintas bandejas', () => {
      const filtroUcp = crearFiltroUCP();
      gestor.registrarFiltro(filtroUcp);

      const correoEnviado = new Correo({
        id: 'env-ucp',
        asunto: 'Respuesta',
        cuerpo: 'Ok',
        remitente: remitenteUcp,
        destinatarios: [alumno],
      });
      gestor.enviar(correoEnviado);

      const resEntrada = gestor.aplicarFiltro('Correos de la UCP', TipoBandeja.ENTRADA);
      const resEnviados = gestor.aplicarFiltro('Correos de la UCP', TipoBandeja.ENVIADOS);

      expect(resEntrada).toHaveLength(3);
      expect(resEnviados).toHaveLength(1);
      expect(resEnviados[0].id).toBe('env-ucp');
    });

    it('deberia rechazar registrar mas de 5 filtros en el gestor', () => {
      gestor.registrarFiltro(crearFiltroUCP());
      gestor.registrarFiltro(crearFiltroAcademicosImportantes());
      gestor.registrarFiltro(crearFiltroPendientesRevision());
      gestor.registrarFiltro(crearFiltroPersonalesPrioritarios('a@b.com'));
      gestor.registrarFiltro(crearFiltroSeguimiento());

      expect(() => {
        gestor.registrarFiltro(new Filtro('Sexto filtro', () => true));
      }).toThrow('No se pueden registrar más de 5 filtros.');
    });

    it('deberia permitir aplicarFiltroEnFavoritos para buscar dentro de la vista de favoritos', () => {
      const filtroUcp = crearFiltroUCP();
      gestor.registrarFiltro(filtroUcp);

      correoUcpExamen.marcarComoFavorito();
      correoExternoEntrega.marcarComoFavorito();

      // Ambos son favoritos, pero solo correoUcpExamen es de UCP
      const favUcp = gestor.aplicarFiltroEnFavoritos('Correos de la UCP');
      expect(favUcp).toHaveLength(1);
      expect(favUcp[0]).toBe(correoUcpExamen);
    });

    it('aplicar filtro a una coleccion no deberia modificar los correos ni almacenar mensajes', () => {
      const filtro = crearFiltroAcademicosImportantes();
      gestor.registrarFiltro(filtro);

      const res = gestor.aplicarFiltro('Correos academicos importantes', TipoBandeja.ENTRADA) as Correo[];
      res.push(correoExternoEntrega); // Mutacion del array devuelto

      // La bandeja original permanece intacta
      expect(gestor.obtenerBandeja(TipoBandeja.ENTRADA)).toHaveLength(5);
    });
  });
});
