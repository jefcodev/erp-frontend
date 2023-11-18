import { TipoComprobante } from "src/app/models/contabilidad/tipo-comprobante.model";

export interface LoadTipoComprobante {
    tipos_comprobantes: TipoComprobante[];
    total: number;
}
