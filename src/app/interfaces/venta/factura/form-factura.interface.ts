export interface FormFactura {
    id_factura_compra: number,
    id_cliente: number,
    id_forma_pago: number,
    //id_cuenta: number,
    id_asiento: number,
    codigo: string,
    fecha_emision: Date,
    fecha_vencimiento: Date,
    estado_pago: string,
    subtotal_sin_impuestos: number,
    total_descuento: number,
    iva: number,
    valor_total: number,
    abono: number,
    saldo: number,
    //estado: string;

}

