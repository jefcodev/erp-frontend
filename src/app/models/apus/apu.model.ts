// models/apu.model.ts
export class Apu {
    codigo: string;
    nombre: string;
    descripcion: string;
    rendimiento: number;
    unidad: string;
    materiales: Material[];
    equipos: Equipo[];
    mano_obra: ManoObra[];
  }
  
  export class Material {
    codigo: string;
    descripcion: string;
    cantidad: number;
    unidad: string;
    desperdicio: number;
    precio: number;
  }
  
  export class Equipo {
    codigoe: string;
    descripcione: string;
    cantidade: number;
    unidade: string;
    precioe: number;
  }
  
  export class ManoObra {
    codigom: string;
    descripcionm: string;
    cantidadm: number;
    unidadm: string;
    preciom: number;
  }
  