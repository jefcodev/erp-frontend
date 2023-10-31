import { Cliente } from "../../../models/venta/cliente.model";

export interface LoadCliente{
    clientes: Cliente[];
    total: number;
}