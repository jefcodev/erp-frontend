
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map } from 'rxjs';


import { CargarProduct } from 'src/app/interfaces/cargar-productos.interface';

import { Product } from 'src/app/models/inventory/product.model';

// API
import { environment } from 'src/environments/environment';

// Variable para la API 
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  public product: Product;

  constructor(private http: HttpClient) {
  }

  get token(): string {
    return localStorage.getItem('token');
  }

  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    }
  }


  /* cargarProducts(){
    ///quotation/clients
    const url=`${base_url}/inventory/products`;
    return this.http.get(url, this.headers)
    .pipe(
      delay(400),
      map((resp :{ok:boolean, products: Product[]
      
      
      }
      ) => resp.products)


    )
  } */
  cargarProducts() {
    const url = `${base_url}/inventory/products`;
    return this.http.get<CargarProduct>(url, this.headers)
      .pipe(
        map(resp => {
          const products = resp.products.map(
            pro => new Product(
               pro.id_tipo_inventario,
            pro.id_categorias,
            pro.id_unidad,
            pro.id_ice,
            pro.codigo,
            pro.descripcion,
            pro.especificaciones,
            pro.ficha,
            pro.stock,
            pro.stock_minimo,
            pro.stock_maximo,
            pro.iva,
            pro.estado,
            pro.precios
            )
          );
          return {
            total: resp.total,
            products
          };
        })
      )
  }
  /*   cargarProducts(){
      const url = `${base_url}/inventory/products`;
      return this.http.get<CargarProduct>(url,this.headers)
        .pipe(
          delay(400),
          map(resp => ({
            total: resp.total,
            products: resp.products.map(
              pro => new Product (pro.sku,pro.name,pro.description, pro.specifications,pro.id_category,
                pro.pur_price, pro.id_iva, pro.id_unit, pro.mini_stock, pro.stock, pro.status, pro.id )
            )
          }))
          
        )
    } */


  createProduct(product) {
    const url = `${base_url}/inventory/products`;
    return this.http.post(url, product, this.headers);
  }
}
