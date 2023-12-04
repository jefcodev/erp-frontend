import { DetalleAsiento } from "../../../models/contabilidad/detalle-asiento.model";

export interface LoadDetalleAsiento {
    detalles_asientos: DetalleAsiento[];
    total_debe: number;
    total_haber: number;
}   