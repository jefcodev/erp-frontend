import { Factura } from "../../../models/compra/factura.model";

export interface LoadFactura {
    facturas: Factura[];
    saldo: number;
}   