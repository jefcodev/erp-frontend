import { Pago } from "../../../models/contabilidad/pago.model";

export interface LoadPago {
    pagos: Pago[];
    total: number;
}
