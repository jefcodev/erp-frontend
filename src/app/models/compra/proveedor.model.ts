export class Proveedor {
    constructor(
        public id_proveedor: number,
        public identificacion: string,
        public nombre: string,
        public apellido: string,
        public nombre_comercial: string,
        public direccion: string,
        public telefono: string,
        public email: string,
        public estado?: boolean,
    ) { }
    imprimirProveedor() {
        console.log(this.identificacion)
    }
}