import { Factura } from "../../../models/venta/factura.model";

export interface LoadFactura {
    facturas: Factura[];
    saldo: number;
}   