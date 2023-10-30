export class TarifaIVA {
    constructor(
        public id_tarifa_iva: number,
        public codigo: number,
        public descripcion: string,
        public porcentaje: number,
        public estado?: boolean,
    ) { }
}