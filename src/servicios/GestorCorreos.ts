import { Correo } from '../domain/models/Correo';
import {
  Bandeja,
  BandejaEliminados,
  TipoBandeja,
} from '../domain/bandejas/Bandeja';

export class GestorCorreos {
  private bandejas: Map<TipoBandeja, Bandeja>;
  private papelera: BandejaEliminados;

  constructor() {
    this.bandejas = new Map<TipoBandeja, Bandeja>();
    this.bandejas.set(TipoBandeja.ENTRADA, new Bandeja(TipoBandeja.ENTRADA));
    this.bandejas.set(TipoBandeja.ENVIADOS, new Bandeja(TipoBandeja.ENVIADOS));
    this.bandejas.set(TipoBandeja.BORRADORES, new Bandeja(TipoBandeja.BORRADORES));

    this.papelera = new BandejaEliminados();
    this.bandejas.set(TipoBandeja.ELIMINADOS, this.papelera);
  }

  obtenerBandeja(tipo: TipoBandeja): ReadonlyArray<Correo> {
    const bandeja = this.bandejas.get(tipo);
    return bandeja ? bandeja.obtenerTodos() : [];
  }

  obtenerUbicacion(idCorreo: string): TipoBandeja | undefined {
    for (const [tipo, bandeja] of this.bandejas.entries()) {
      if (bandeja.contiene(idCorreo)) {
        return tipo;
      }
    }
    return undefined;
  }

  recibir(correo: Correo): void {
    const bandejaEntrada = this.bandejas.get(TipoBandeja.ENTRADA)!;
    bandejaEntrada.agregar(correo);
  }

  guardarEnBorradores(correo: Correo): void {
    const bandejaBorradores = this.bandejas.get(TipoBandeja.BORRADORES)!;
    bandejaBorradores.agregar(correo);
  }

  enviar(correo: Correo): void {
    // Si estaba en borradores, se retira de alli
    const bandejaBorradores = this.bandejas.get(TipoBandeja.BORRADORES)!;
    if (bandejaBorradores.contiene(correo.id)) {
      bandejaBorradores.quitar(correo.id);
    }

    // Se agrega a la bandeja de Enviados
    const bandejaEnviados = this.bandejas.get(TipoBandeja.ENVIADOS)!;
    bandejaEnviados.agregar(correo);
  }

  mover(idCorreo: string, destino: TipoBandeja): void {
    const ubicacionActual = this.obtenerUbicacion(idCorreo);
    if (!ubicacionActual) {
      throw new Error(`No se encontro el correo con id "${idCorreo}" en ninguna bandeja.`);
    }

    if (ubicacionActual === destino) {
      return;
    }

    if (destino === TipoBandeja.ELIMINADOS) {
      this.eliminar(idCorreo);
      return;
    }

    const bandejaOrigen = this.bandejas.get(ubicacionActual)!;
    const correo = bandejaOrigen.quitar(idCorreo)!;

    const bandejaDestino = this.bandejas.get(destino)!;
    bandejaDestino.agregar(correo);
  }

  eliminar(idCorreo: string): void {
    const ubicacionActual = this.obtenerUbicacion(idCorreo);
    if (!ubicacionActual) {
      throw new Error(`No se encontro el correo con id "${idCorreo}" para eliminar.`);
    }

    if (ubicacionActual === TipoBandeja.ELIMINADOS) {
      return; // Ya esta en eliminados
    }

    const bandejaOrigen = this.bandejas.get(ubicacionActual)!;
    const correo = bandejaOrigen.quitar(idCorreo)!;

    this.papelera.agregarConOrigen(correo, ubicacionActual);
  }

  restaurar(idCorreo: string): void {
    const restaurado = this.papelera.restaurar(idCorreo);
    if (!restaurado) {
      throw new Error(`No se puede restaurar el correo "${idCorreo}" porque no esta en Eliminados.`);
    }

    const bandejaDestino = this.bandejas.get(restaurado.bandejaOrigen)!;
    bandejaDestino.agregar(restaurado.correo);
  }
}
