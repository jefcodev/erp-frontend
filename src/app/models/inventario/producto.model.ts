export class Producto {
    constructor(
        public id_producto: number,
        public descripcion: string,
        public precio_compra: number,
        public precio_venta1: number,
        public precio_venta2: number,
        public precio_venta3: number,
        public stock: number,
        public stock_minimo: number,
        public stock_maximo: number,
        public utilidad: number,
        public descuento: number,
        public impuesto: number,
        public estado?: boolean,
    ) { }
}