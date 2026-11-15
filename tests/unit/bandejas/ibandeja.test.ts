import { describe, it, expect } from 'vitest';
import { IBandeja } from '../../../src/domain/bandejas/IBandeja';
import { Bandeja, TipoBandeja, BandejaEliminados } from '../../../src/domain/bandejas/Bandeja';
import { GestorCorreos } from '../../../src/servicios/GestorCorreos';
import { Correo } from '../../../src/domain/models/Correo';
import { Contacto } from '../../../src/domain/models/Contacto';

describe('IBandeja y Desacoplamiento (T1 / E7 / SOLID DIP)', () => {
  it('Bandeja debe implementar el contrato IBandeja', () => {
    const bandeja: IBandeja = new Bandeja(TipoBandeja.ENTRADA);
    expect(bandeja.tipo).toBe(TipoBandeja.ENTRADA);
    expect(typeof bandeja.cantidad).toBe('function');
    expect(typeof bandeja.contiene).toBe('function');
    expect(typeof bandeja.obtenerPorId).toBe('function');
    expect(typeof bandeja.obtenerTodos).toBe('function');
    expect(typeof bandeja.agregar).toBe('function');
    expect(typeof bandeja.quitar).toBe('function');
  });

  it('BandejaEliminados debe implementar el contrato IBandeja', () => {
    const papelera: IBandeja = new BandejaEliminados();
    expect(papelera.tipo).toBe(TipoBandeja.ELIMINADOS);
    expect(typeof papelera.cantidad).toBe('function');
  });

  it('GestorCorreos debe permitir inyeccion de dependencias de bandejas personalizadas', () => {
    const entradaPersonalizada = new Bandeja(TipoBandeja.ENTRADA);
    const enviadosPersonalizada = new Bandeja(TipoBandeja.ENVIADOS);
    const borradoresPersonalizada = new Bandeja(TipoBandeja.BORRADORES);
    const papeleraPersonalizada = new BandejaEliminados();

    const gestor = new GestorCorreos({
      bandejaEntrada: entradaPersonalizada,
      bandejaEnviados: enviadosPersonalizada,
      bandejaBorradores: borradoresPersonalizada,
      bandejaEliminados: papeleraPersonalizada,
    });

    const contacto = new Contacto('Profe', 'profe@ucp.edu.ar');
    const correo = new Correo({
      id: 'c-inyectado',
      asunto: 'Inyeccion DIP',
      cuerpo: 'Probando desacople',
      remitente: contacto,
      destinatarios: [contacto],
    });

    gestor.recibir(correo);
    expect(entradaPersonalizada.contiene('c-inyectado')).toBe(true);
  });

  it('GestorCorreos debe seguir instanciandose sin argumentos con valores por defecto', () => {
    const gestor = new GestorCorreos();
    expect(gestor.obtenerBandeja(TipoBandeja.ENTRADA)).toEqual([]);
  });
});
