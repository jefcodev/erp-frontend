export class EstadoResultado {
    constructor(
        public id_cuenta: number,
        public codigo: string,
        public descripcion: string,
        public saldo: number,
    ) { }
}
export class SumaIEG {
    constructor(
        public ingreso: string,
        public egreso: string,
        public gasto: string,
    ) { }
}