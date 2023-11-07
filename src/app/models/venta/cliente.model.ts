export class Cliente {
    constructor(
        public id_cliente: number,
        public identificacion: string,
        public razon_social: string,
        public direccion: string,
        public telefono: string,
        public email: string,
        public tipo_contribuyente: string,// no en html
        public regimen: string,// no en html
        public estado?: boolean,
    ) { }
}