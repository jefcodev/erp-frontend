export class DetalleFactura {
    constructor(
        //public id_detalle_factura_compra: number, // ojo se activo esta linea para mostrar los detalles
        public id_factura_compra: number,
        public id_producto: number,
        public codigo_principal: string,
        public descripcion: string,
        public cantidad: number,
        public precio_unitario: number,
        public descuento: number,
        public precio_total_sin_impuesto: number,
        //public codigo: string,
        //public codigo_porcentaje: string,
        public tarifa: number,
        //public base_imponible: number,
        public valor: number,
        //public iva: number,
        //public ice: number,
        //public precio_total: number,
    ) { }
}

export class DetalleFacturaU {
    constructor(
        public id_detalle_factura_compra: number,
        public id_producto: number,
        public id_factura_compra: number,
        public codigo_principal: string,
        public detalle_adicional: string,
        public cantidad: number,
        public descripcion: string,
        public precio_unitario: number,
        public subsidio: number,
        public precio_sin_subsidio: number,
        public descuento: number,
        public codigo_auxiliar: string,
        public precio_total: number,
        public iva: number,
        public ice: number,
    ) { }
}