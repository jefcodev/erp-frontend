export class TipoComprobante {
    constructor(
        public id_tipo_comprobante: number,
        public codigo: string,
        public descripcion: string,
        public estado?: boolean,
    ) { }
}