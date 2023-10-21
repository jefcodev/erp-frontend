export class Asiento {
    constructor(
        public id_asiento: number,
        public referencia: string,
        public documento: string,
        public observacion: string,
        public fecha?: Date,
        public estado?: boolean
    ) { }
}

