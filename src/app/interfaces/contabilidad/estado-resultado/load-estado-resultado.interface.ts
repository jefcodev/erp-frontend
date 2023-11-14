import { EstadoResultado, SumaIEG } from "src/app/models/contabilidad/estado-resultado.model";

export interface LoadEstadoResultado {
    estado_resultado: EstadoResultado[];
    suma_ieg: SumaIEG[];
}
