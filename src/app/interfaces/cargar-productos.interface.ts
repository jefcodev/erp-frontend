import { Product } from "../models/inventory/product.model";

export interface CargarProduct{
    total: number;
    products: Product[];
}