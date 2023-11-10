export class Pago {
    constructor(
        public id_pago: number,
        public id_factura_compra: number,
        public id_factura_venta: number,
        public id_forma_pago: number,
        public fecha_pago: Date ,
        public abono: number,
        public observacion: string,
        public estado?: boolean,
    ) { }
}