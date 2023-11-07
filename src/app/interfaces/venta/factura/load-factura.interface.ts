import { Factura } from "../../../models/venta/factura.model";

export interface LoadFactura {
    facturas: Factura[];
    totalFacturas: number;
    totalFacturasPendientes: number;
    saldo: number;
    sumaSaldo: number;
    sumaImporteTotal: number;
}   