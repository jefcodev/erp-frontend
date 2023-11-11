import { Asiento } from "../../../models/contabilidad/asiento.model";

export interface LoadAsiento{
    asientos: Asiento[];
    totalAsientos: number;
}   