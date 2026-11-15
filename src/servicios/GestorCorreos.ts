import { Correo } from '../domain/models/Correo';
import { Contacto } from '../domain/models/Contacto';
import { Borrador } from '../domain/models/Borrador';
import {
  Bandeja,
  BandejaEliminados,
  TipoBandeja,
} from '../domain/bandejas/Bandeja';
import { IBandeja } from '../domain/bandejas/IBandeja';

export interface OpcionesGestorCorreos {
  bandejaEntrada?: IBandeja<any>;
  bandejaEnviados?: IBandeja<any>;
  bandejaBorradores?: IBandeja<any>;
  bandejaEliminados?: BandejaEliminados<any>;
}

export class GestorCorreos {
  private bandejas: Map<TipoBandeja, IBandeja<any>>;
  private papelera: BandejaEliminados<any>;

  // Inyeccion de dependencias desacoplada con valores por defecto (SOLID: DIP)
  constructor(opciones: OpcionesGestorCorreos = {}) {
    this.bandejas = new Map<TipoBandeja, IBandeja<any>>();
    this.bandejas.set(
      TipoBandeja.ENTRADA,
      opciones.bandejaEntrada ?? new Bandeja(TipoBandeja.ENTRADA)
    );
    this.bandejas.set(
      TipoBandeja.ENVIADOS,
      opciones.bandejaEnviados ?? new Bandeja(TipoBandeja.ENVIADOS)
    );
    this.bandejas.set(
      TipoBandeja.BORRADORES,
      opciones.bandejaBorradores ?? new Bandeja(TipoBandeja.BORRADORES)
    );

    this.papelera = opciones.bandejaEliminados ?? new BandejaEliminados();
    this.bandejas.set(TipoBandeja.ELIMINADOS, this.papelera);
  }

  obtenerBandeja(tipo: TipoBandeja): ReadonlyArray<Correo> {
    const bandeja = this.bandejas.get(tipo);
    return bandeja ? (bandeja.obtenerTodos() as ReadonlyArray<Correo>) : [];
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

  guardarBorrador(borrador: Borrador): void {
    const bandejaBorradores = this.bandejas.get(TipoBandeja.BORRADORES)!;
    bandejaBorradores.agregar(borrador);
  }

  obtenerBorrador(id: string): Borrador | undefined {
    const bandejaBorradores = this.bandejas.get(TipoBandeja.BORRADORES)!;
    const elemento = bandejaBorradores.obtenerPorId(id);
    return elemento instanceof Borrador ? elemento : undefined;
  }

  editarBorrador(
    id: string,
    cambios: {
      asunto?: string;
      cuerpo?: string;
      remitente?: Contacto;
      agregarDestinatario?: Contacto;
      quitarDestinatario?: string;
    }
  ): Borrador {
    const borrador = this.obtenerBorrador(id);
    if (!borrador) {
      throw new Error(`No se encontro el borrador con id "${id}".`);
    }

    if (cambios.asunto !== undefined) {
      borrador.editarAsunto(cambios.asunto);
    }
    if (cambios.cuerpo !== undefined) {
      borrador.editarCuerpo(cambios.cuerpo);
    }
    if (cambios.remitente !== undefined) {
      borrador.definirRemitente(cambios.remitente);
    }
    if (cambios.agregarDestinatario !== undefined) {
      borrador.agregarDestinatario(cambios.agregarDestinatario);
    }
    if (cambios.quitarDestinatario !== undefined) {
      borrador.quitarDestinatario(cambios.quitarDestinatario);
    }

    return borrador;
  }

  enviarBorrador(id: string): Correo {
    const borrador = this.obtenerBorrador(id);
    if (!borrador) {
      throw new Error(`No se encontro el borrador con id "${id}".`);
    }

    // Valida y convierte a Correo inmutable (RF-02 y RF-07)
    const correo = borrador.aCorreo();

    const bandejaBorradores = this.bandejas.get(TipoBandeja.BORRADORES)!;
    bandejaBorradores.quitar(id);

    const bandejaEnviados = this.bandejas.get(TipoBandeja.ENVIADOS)!;
    bandejaEnviados.agregar(correo);

    return correo;
  }

  enviar(correo: Correo): void {
    const bandejaBorradores = this.bandejas.get(TipoBandeja.BORRADORES)!;
    if (bandejaBorradores.contiene(correo.id)) {
      bandejaBorradores.quitar(correo.id);
    }

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
      return;
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

  obtenerNoLeidos(tipo: TipoBandeja): ReadonlyArray<Correo> {
    const correos = this.obtenerBandeja(tipo);
    return correos.filter((correo) => !correo.leido);
  }

  obtenerFavoritos(): ReadonlyArray<Correo> {
    const bandejasActivas: TipoBandeja[] = [
      TipoBandeja.ENTRADA,
      TipoBandeja.ENVIADOS,
      TipoBandeja.BORRADORES,
    ];

    const todosLosActivos: Correo[] = [];
    for (const tipo of bandejasActivas) {
      todosLosActivos.push(...this.obtenerBandeja(tipo));
    }

    return todosLosActivos.filter((correo) => correo.favorito);
  }
}
