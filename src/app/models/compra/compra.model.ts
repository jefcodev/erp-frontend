export class Compra {
    constructor(
        public id_compra: number,
        public id_tipo_comprobante: number,
        public id_proveedor: number,
        public id_asiento: number,
        public id_info_tributaria: number,
        public clave_acceso: string,
        public codigo: string,
        public fecha_emision: Date,
        public fecha_vencimiento: Date,
        public estado_pago: string,
        public total_sin_impuesto: number,
        public total_descuento: number,
        public propina: number,
        public valor: number,
        public importe_total: number,
        //public saldo: number,
        
        public id_forma_pago: number,
        public abono: number,
        public observacion: string,

        public estado?: Boolean
    ) { }
}