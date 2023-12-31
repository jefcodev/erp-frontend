export class Proforma {
    id_proforma?: number
    id_cliente: number;
    fecha: string;
    fechaForm?: string;
    descuento: number;
    total: number;
    estado?: boolean;
    detalle: Detalle[];
}

export class Detalle {
    proforma_id?: number;
    item: string;
    item_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento: number;
}