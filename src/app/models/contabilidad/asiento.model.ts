export class Asiento {
    constructor(
        public id_asiento: number,
        public fecha_asiento: Date,
        public referencia: string,
        public documento: string,
        public observacion: string,
        public fecha_registro?: Date,
        public estado?: boolean
    ) { }
}

