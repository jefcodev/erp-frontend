export class FormaPago {
    constructor(
        public id_forma_pago: number,
        public codigo: string,
        public descripcion: string,
        public estado?: boolean,
    ) { }
}