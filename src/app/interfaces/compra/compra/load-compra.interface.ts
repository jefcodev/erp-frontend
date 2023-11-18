import { Compra } from "../../../models/compra/compra.model";

export interface LoadCompra {
    compras: Compra[];
    totalCompras: number;
    totalComprasPendientes: number;
    saldo: number;
    sumaSaldo: number;
    sumaImporteTotal: number;
}   