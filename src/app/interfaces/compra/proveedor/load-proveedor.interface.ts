import { Proveedor } from "../../../models/compra/proveedor.model";

export interface LoadProveedor {
    proveedores: Proveedor[];
    total: number;
}
