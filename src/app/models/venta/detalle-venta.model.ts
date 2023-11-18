export class DetalleVenta {
    constructor(
        //public id_detalle_factura_venta: number, // ojo se actvo esta linea para mostrar los detalles
        public id_venta: number,
        public id_producto: number,
        public codigo_principal: string,
        public descripcion: string,
        public cantidad: number,
        public precio_unitario: number,
        public descuento: number,
        public precio_total_sin_impuesto: number,

        public codigo: string,
        public codigo_porcentaje: string,
        public tarifa: number,
        public base_imponible: number,
        public valor: number,
        public ice: number,
        public precio_total: number,
    ) { }
}

export class DetalleVentaU {
    constructor(
        public id_detalle_venta: number,
        public id_producto: number,
        public id_factura_venta: number,
        public codigo_principal: string,
        public cantidad: number,
        public descripcion: string,
        public precio_unitario: number,
        public descuento: number,
        public precio_total: number,
        public ice: number,
    ) { }
}