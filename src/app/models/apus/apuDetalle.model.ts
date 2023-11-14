export class ApuDetalle {

  constructor(
    public id_capitulo: number,
    public codigo: string,
    public nombre: string,
    public descripcion: string,
    public rendimiento: string,
    public unidad: string,
    public total : number
  ){
  }
    
  }
  
  export class ApuManoObra {
    id_mano_obra: number;
    id_capitulo: number;
    codigo: string;
    descripcion: string;
    cantidad: string;
    unidad: string;
    precio: string;
  }
  
  export class ApuMateriales {
    id_materiales: number;
    id_capitulo: number;
    codigo: string;
    descripcion: string;
    cantidad: string;
    unidad: string;
    desperdicio: string;
    precio: string;
  }
  
  export class ApuEquipos {
    id_equipos: number;
    id_capitulo: number;
    codigo: string;
    descripcion: string;
    cantidad: string;
    unidad: string;
    precio: string;
  }
  