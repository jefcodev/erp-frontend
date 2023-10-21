export class LibroMayor {
    constructor(
        public codigo: string,
        public descripcion: string,
        public total_debe: number,
        public total_haber: number,
        public saldo: number,
    ) { }
}
export class SumaDebeHaber {
    constructor(
        public total_debe: number,
        public total_haber: number,
    ) { }
}