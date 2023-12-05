export class Venta {
    constructor(
        //public id_asiento: number,
        public id_tipo_comprobante: number,
        public id_cliente: number,
        public clave_acceso: string,
        public codigo: string,
        public fecha_emision: Date,
        public total_sin_impuesto: number,
        public total_descuento: number,
        public valor: number,
        public importe_total: number,
        //public saldo: number,
        
        public abono: number,
        public observacion: string,
        
        public id_forma_pago?: number,
        public propina?: number,
        public id_info_tributaria?: number,
        public estado_pago?: string,
        public fecha_vencimiento?: Date,
        public id_venta?: number,
        public estado?: Boolean,
        public id_proforma?: number
    ) { }
}