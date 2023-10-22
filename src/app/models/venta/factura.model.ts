export class Factura {
    constructor(
        public id_factura_venta: number,
        public id_cliente: number,
        public id_forma_pago: number,
        //public id_cuenta: number,
        public id_asiento: number,
        public codigo: string,
        public fecha_emision: Date,
        public fecha_vencimiento: Date,
        public estado_pago: string,
        public subtotal_sin_impuestos: number,
        public total_descuento: number,
        public iva: number,
        public valor_total: number,
        public abono: number,
        public saldo: number,
        public estado?: Boolean
    ) { }
}