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
        public ingresos: string,
        public egresos: string,
        public gastos: string,
    ) { }
}