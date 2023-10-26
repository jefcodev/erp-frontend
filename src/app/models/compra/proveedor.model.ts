export class Proveedor {
    constructor(
        public id_proveedor: number,
        public identificacion: string,
        public razon_social: string,
        public nombre_comercial: string,
        public direccion: string,
        public telefono: string,
        public email: string,
        public tipo_contribuyente: string,// no en html
        public regimen: string,// no en html
        public estado?: boolean,
    ) { }
}