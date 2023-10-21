import { LibroDiario, SumaDebeHaber } from "../../../models/contabilidad/libro-diario.model";

export interface LoadLibroDiario{
    libro_diario: LibroDiario[];
    suma_debe_haber: SumaDebeHaber[];
}
