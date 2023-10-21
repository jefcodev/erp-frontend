export class Cuenta {
    constructor(
        public id_cuenta: number,
        public codigo: string,
        public descripcion: string,
        public cuenta_padre: string,
        public estado?: boolean,
    ) { }
}