import { Venta } from "../../../models/venta/venta.model";

export interface LoadVenta {
    ventas: Venta[];
    totalVentas: number;
    totalVentasPendientes: number;
    saldo: number;
    sumaSaldo: number;
    sumaImporteTotal: number;
}   