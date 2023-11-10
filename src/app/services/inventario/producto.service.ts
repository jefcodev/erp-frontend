import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
//import { FormProducto } from '../..//interfaces/inventario/producto/form-producto.interface';
import { LoadProducto } from '../../interfaces/inventario/producto/load-producto.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { Producto } from 'src/app/models/inventario/producto.model';
//import { ProductoU } from 'src/app/models/inventario/producto.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private hhtp: HttpClient,
    private router: Router) { }
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
 

  loadProductosHerramientas() {
    const url = `${base_url}/inventario/productos/herramientas`;
    return this.hhtp.get<LoadProducto>(url, this.headers);
  }
  loadProductosMateriales() {
    const url = `${base_url}/inventario/productos/materiales`;
    return this.hhtp.get<LoadProducto>(url, this.headers);
  }
  loadProductos() {
    const url = `${base_url}/inventario/productos`;
    return this.hhtp.get<LoadProducto>(url, this.headers);
  }
  
  loadProductosAll() {
    const url = `${base_url}/productos/all/`;
    return this.hhtp.get<LoadProducto>(url, this.headers);
  }

  loadProductoById(id_producto: any) {
    const url = `${base_url}/inventario/productos/${id_producto}`;
    return this.hhtp.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, producto: Producto }) => resp.producto)
      )
  }

  //createProducto(formData: FormProducto) {
  createProducto(formData: any) {
    const url = `${base_url}/inventario/productos`;
    return this.hhtp.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, producto: Producto[] }) => resp.producto)
      )
  }

  createProductoArray(productos: Producto[]) {
    const url = `${base_url}/inventario/productos`;
    return this.hhtp.post<Producto[]>(url, productos, this.headers);
  }
  
  createProductoArray2(productos: Producto[]) {
    const url = `${base_url}/inventario/productos`;
    const formData = { productos }; // Crear un objeto con una propiedad 'detalles' que contenga el arreglo de detalles
    return this.hhtp.post(url, formData, this.headers).pipe(
      map((resp: { ok: boolean, producto: Producto[] }) => resp.producto)
    )
  }

  //updateProducto(producto: ProductoU) {
  updateProducto(producto: Producto) {
    const url = `${base_url}/productos/${producto.id_producto}`;
    return this.hhtp.put(url, producto, this.headers);
  }

  deleteProducto(id_producto: any) { //OJO: any
    const url = `${base_url}/productos/${id_producto}`;
    return this.hhtp.delete(url, this.headers);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  // Validación de token 
  validarToken(): Observable<boolean> {
    const token = localStorage.getItem('token') || '';
    return this.hhtp.get(`${base_url}/login/renew`, {
      headers: {
        'x-token': token
      }

    }).pipe(
      tap((resp: any) => {
        /*  console.log(resp);//OJO
        const {nombre, apellido,email,estado ,rol_id, img, uid} = resp.usuario;
        this.usuario = new Usuario(uid,nombre, apellido, email, rol_id,img,estado,''); */
        //this.usuario.imprimirUsuario();
        localStorage.setItem('token', resp.token);
      }),
      map(resp => true),
      catchError(error => of(false))
    )
  }

  // Validación de token Fin //OJO
  login(formData: any) {
    const fomrLogin: LoginForm = formData;
    return this.hhtp.post(`${base_url}/login`, fomrLogin)
      .pipe(
        tap((resp: any) => {
          localStorage.setItem('token', resp.token)
        })
      )
  }

}




