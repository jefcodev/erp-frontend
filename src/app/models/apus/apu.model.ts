// models/apu.model.ts
export class Apu {
    codigo: string;
    nombre: string;
    descripcion: string;
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
    codigo: string;
    descripcion: string;
    cantidad: number;
    unidad: string;
    precio: number;
  }
  
  export class ManoObra {
    codigo: string;
    descripcion: string;
    cantidad: number;
    unidad: string;
    precio: number;
  }
  