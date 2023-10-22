export class Cliente {
    constructor(
        public id_cliente: number,
        public identificacion: string,
        public nombre: string,
        public apellido: string,
        public direccion: string,
        public telefono: string,
        public email: string,
        public estado?: boolean,
    ) { }
    imprimirCliente() {
        console.log(this.identificacion)
    }
}