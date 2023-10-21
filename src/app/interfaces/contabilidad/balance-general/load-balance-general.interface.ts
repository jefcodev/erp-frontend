import { BalanceGeneral, SumaAPP } from "src/app/models/contabilidad/balance-general";

export interface LoadBalanceGeneral {
    balance_general: BalanceGeneral[];
    suma_app: SumaAPP[];
}
