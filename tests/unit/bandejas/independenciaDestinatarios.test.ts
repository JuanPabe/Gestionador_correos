/**
 * Test de independencia entre bandejas de distintos destinatarios.
 *
 * Escenario: Pepito manda un correo a Ana y Juan.
 *   - Cada uno recibe el correo en su propia Bandeja independiente.
 *   - Juan elimina el correo de su bandeja.
 *   - El correo debe seguir presente en la bandeja de Ana y en la de Pepito (enviados).
 */

import { Correo } from '../../../src/domain/models/Correo';
import { Contacto } from '../../../src/domain/models/Contacto';
import { Bandeja, TipoBandeja } from '../../../src/domain/bandejas/Bandeja';

describe('Independencia de bandejas entre destinatarios', () => {
  // Contactos del escenario
  const pepito = new Contacto('Pepito', 'pepito@gmail.com');
  const ana = new Contacto('Ana', 'ana@gmail.com');
  const juan = new Contacto('Juan', 'juan@gmail.com');

  // Fabrica un correo enviado de Pepito a Ana y Juan
  function crearCorreo(id: string): Correo {
    return new Correo({
      id,
      asunto: 'Reunion del lunes',
      cuerpo: 'Hola, les mando los detalles de la reunion.',
      remitente: pepito,
      destinatarios: [ana, juan],
    });
  }

  it('cada destinatario recibe el correo en su propia bandeja independiente', () => {
    const bandejaAna = new Bandeja<Correo>(TipoBandeja.ENTRADA);
    const bandejaJuan = new Bandeja<Correo>(TipoBandeja.ENTRADA);

    const correo = crearCorreo('correo-001');
    bandejaAna.agregar(correo);
    bandejaJuan.agregar(correo);

    expect(bandejaAna.contiene(correo.id)).toBe(true);
    expect(bandejaJuan.contiene(correo.id)).toBe(true);
  });

  it('cuando Juan elimina el correo de su bandeja, el correo sigue en la de Ana', () => {
    const bandejaAna = new Bandeja<Correo>(TipoBandeja.ENTRADA);
    const bandejaJuan = new Bandeja<Correo>(TipoBandeja.ENTRADA);

    const correo = crearCorreo('correo-002');
    bandejaAna.agregar(correo);
    bandejaJuan.agregar(correo);

    // Juan elimina el correo de su bandeja
    bandejaJuan.quitar(correo.id);

    // Ana conserva su correo intacto
    expect(bandejaAna.contiene(correo.id)).toBe(true);
    expect(bandejaAna.cantidad()).toBe(1);

    // Juan ya no lo tiene
    expect(bandejaJuan.contiene(correo.id)).toBe(false);
    expect(bandejaJuan.cantidad()).toBe(0);
  });

  it('cuando Juan elimina el correo de su bandeja, la bandeja de enviados de Pepito conserva el correo', () => {
    const bandejaEnviadosPepito = new Bandeja<Correo>(TipoBandeja.ENVIADOS);
    const bandejaAna = new Bandeja<Correo>(TipoBandeja.ENTRADA);
    const bandejaJuan = new Bandeja<Correo>(TipoBandeja.ENTRADA);

    const correo = crearCorreo('correo-003');
    bandejaEnviadosPepito.agregar(correo);
    bandejaAna.agregar(correo);
    bandejaJuan.agregar(correo);

    // Juan borra su copia
    bandejaJuan.quitar(correo.id);

    // Pepito todavia lo tiene en enviados
    expect(bandejaEnviadosPepito.contiene(correo.id)).toBe(true);
    // Ana todavia lo tiene en entrada
    expect(bandejaAna.contiene(correo.id)).toBe(true);
    // Juan ya no
    expect(bandejaJuan.contiene(correo.id)).toBe(false);
  });

  it('las bandejas son completamente independientes: eliminar de una no afecta el total de las otras', () => {
    const bandejaEnviadosPepito = new Bandeja<Correo>(TipoBandeja.ENVIADOS);
    const bandejaAna = new Bandeja<Correo>(TipoBandeja.ENTRADA);
    const bandejaJuan = new Bandeja<Correo>(TipoBandeja.ENTRADA);

    const correo = crearCorreo('correo-004');
    bandejaEnviadosPepito.agregar(correo);
    bandejaAna.agregar(correo);
    bandejaJuan.agregar(correo);

    bandejaJuan.quitar(correo.id);

    expect(bandejaEnviadosPepito.cantidad()).toBe(1);
    expect(bandejaAna.cantidad()).toBe(1);
    expect(bandejaJuan.cantidad()).toBe(0);
  });

  it('quitar de una bandeja devuelve el correo y deja la bandeja vacia', () => {
    const bandejaJuan = new Bandeja<Correo>(TipoBandeja.ENTRADA);
    const correo = crearCorreo('correo-005');
    bandejaJuan.agregar(correo);

    const removido = bandejaJuan.quitar(correo.id);

    expect(removido).toBe(correo);
    expect(bandejaJuan.cantidad()).toBe(0);
  });
});
