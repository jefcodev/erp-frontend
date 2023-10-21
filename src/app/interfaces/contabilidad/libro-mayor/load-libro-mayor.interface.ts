import { LibroMayor, SumaDebeHaber } from "../../../models/contabilidad/libro-mayor.model";

export interface LoadLibroMayor{
    libro_mayor: LibroMayor[];
    suma_debe_haber: SumaDebeHaber[];
}
