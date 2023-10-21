export class BalanceGeneral {
    constructor(
        public id_cuenta: number,
        public codigo: string,
        public descripcion: string,
        public saldo: number,
    ) { }
}
export class SumaAPP {
    constructor(
        public activo: string,
        public pasivo: string,
        public patrimonio: string,
        //public activo: number,
        //public pasivo: number,
        //public patrimonio: number,
    ) { }
}