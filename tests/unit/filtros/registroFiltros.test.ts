import { describe, it, expect } from 'vitest';
import { Filtro } from '../../../src/domain/filtros/Filtro';
import { RegistroFiltros } from '../../../src/domain/filtros/RegistroFiltros';
import { estaLeido } from '../../../src/domain/filtros/PredicadosCorreo';

const crearFiltro = (nombre: string): Filtro => new Filtro(nombre, estaLeido);

describe('RegistroFiltros', () => {
  it('registra un filtro y lo obtiene por nombre sin distinguir mayúsculas', () => {
    const registro = new RegistroFiltros();
    const filtro = crearFiltro('Pendientes');

    registro.registrar(filtro);

    expect(registro.obtener('pendientes')).toBe(filtro);
    expect(registro.cantidad()).toBe(1);
  });

  it('devuelve undefined si el filtro no existe', () => {
    expect(new RegistroFiltros().obtener('Inexistente')).toBeUndefined();
  });

  it('rechaza un nombre de filtro repetido', () => {
    const registro = new RegistroFiltros();
    registro.registrar(crearFiltro('Pendientes'));

    expect(() => registro.registrar(crearFiltro('PENDIENTES'))).toThrow();
    expect(registro.cantidad()).toBe(1);
  });

  it('permite hasta cinco filtros y rechaza el sexto', () => {
    const registro = new RegistroFiltros();
    for (let i = 1; i <= 5; i++) {
      registro.registrar(crearFiltro(`Filtro ${i}`));
    }

    expect(() => registro.registrar(crearFiltro('Filtro 6'))).toThrow();
    expect(registro.cantidad()).toBe(5);
  });

  it('listar devuelve una copia que no altera el registro', () => {
    const registro = new RegistroFiltros();
    registro.registrar(crearFiltro('Uno'));

    const lista = registro.listar() as Filtro[];
    lista.pop();

    expect(registro.cantidad()).toBe(1);
  });
});