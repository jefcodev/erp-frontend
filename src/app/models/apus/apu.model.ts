// models/apu.model.ts
export class Apu {
    id_capitulo?: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    rendimiento: number;
    unidad: string;
    total: number;
    materiales: Material[];
    equipos: Equipo[];
    mano_obra: ManoObra[];
    transporte: Transporte[];
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
  export class Transporte {
    codigot: string;
    descripciont: string;
    cantidadt: number;
    unidadt: string;
    preciot: number;
  }
  