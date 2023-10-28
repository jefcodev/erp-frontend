export class Producto {
    constructor(
        public id_producto: number, // con esto puedo ver en html
        public id_tipo_inventario: number,
        public id_marca: number,
        public id_clasificacion: number,
        public id_unidad_medida: number,
        public id_tarifa_iva: number,
        public id_tarifa_ice: number,
        public id_tipo_producto: number,
        public id_lista_precio: number,
        public codigo_principal: string,
        public descripcion: string,
        public stock: number,
        public stock_minimo: number,
        public stock_maximo: number,
        public utilidad: number,
        public descuento: number,
        public iva: number,
        public ice: number,
        public precio_compra: number,
        public precio_venta: number,
        public ficha: string,
        public nota: string,
        public especificacion: string,
        public fecha_registro: Date,
        public fecha_caducidad: Date,
        public fecha_modificacion: Date,
        public imagen_producto: string,
        public estado?: boolean,
    ) { }
}