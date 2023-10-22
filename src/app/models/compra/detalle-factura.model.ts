export class DetalleFactura {
    constructor(
        //public id_detalle_factura_compra: number, // ojo se actvo esta linea para mostrar los detalles
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