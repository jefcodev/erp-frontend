export class Proforma {
    id_cliente: number;
    fecha: string;
    descuento: number;
    total: number;
    estado?: boolean;
    productos: Detalle[];
}

export class Detalle {
    proforma_id?: number;
    item: string;
    item_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento: number;
}