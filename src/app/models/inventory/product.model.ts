export class Product {
    constructor( 
        public id_tipo_inventario: number,
        public id_categorias: number,
        public id_unidad: number,
        public id_ice: number,
        public codigo: string,
        public descripcion: string,
        public especificaciones: string,
        public ficha: string,
        public stock_minimo: number,
        public mini_stock: number,
        public stock: number,
        public iva: boolean,
        public estado?: boolean,
        public stock_maximo?: number,
        public precios?: number,
        public id_produco?: number,
        
    ){}
  }