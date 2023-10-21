export class DetalleAsiento {
    constructor(
        //public id_detalle_asiento: number,
        public id_asiento: number,
        public id_cuenta: number,
        public descripcion: string,
        public documentod: string,
        public debe: number,
        public haber: number,
    ) { }
}

export class DetalleAsientoU {
    constructor(
        public id_detalle_asiento: number,
        public id_cuenta: number,
        public id_asiento: number,
        public descripcion: string,
        public documento: string,
        public debe: number,
        public haber: number,
    ) { }
}