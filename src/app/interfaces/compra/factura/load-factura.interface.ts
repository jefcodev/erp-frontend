import { Factura } from "../../../models/compra/factura.model";

export interface LoadFactura {
    facturas: Factura[];
    totalFacturas: number;
    totalFacturasPendientes: number;
    saldo: number;
    sumaSaldo: number;
    sumaImporteTotal: number;
}   