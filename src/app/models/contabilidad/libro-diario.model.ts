export class LibroDiario {
    constructor(
        public id_asiento: number,
        public fecha: Date,
        public codigo: string,
        public descripcion: string,
        public debe: number,
        public haber: number,
    ) { }
}
export class SumaDebeHaber {
    constructor(
        public total_debe: number,
        public total_haber: number,
    ) { }
}