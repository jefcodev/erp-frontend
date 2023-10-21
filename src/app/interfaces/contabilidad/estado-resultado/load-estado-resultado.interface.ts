import { EstadoResultado, SumaIEG } from "src/app/models/contabilidad/estado-resultado";

export interface LoadEstadoResultado {
    estado_resultado: EstadoResultado[];
    suma_ieg: SumaIEG[];
}
