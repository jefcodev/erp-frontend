import { FacturaModel } from "../../../models/compra/factura.model";

export interface LoadFactura {
    facturas: FacturaModel[];
    saldo: number;
}   