import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
//import { FormDetalleCompra } from 'src/app/interfaces/compra/detalle-compra/form-detalle-asiento.interface';
import { LoadDetalleCompra } from 'src/app/interfaces/compra/detalle-compra/load-detalle-compra.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { DetalleCompra } from 'src/app/models/compra/detalle-compra.model';
import { DetalleCompraU } from 'src/app/models/compra/detalle-compra.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class DetalleCompraService {

  constructor(private http: HttpClient,
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

  loadDetalleCompras() {
    const url = `${base_url}/detalles-compras`;
    return this.http.get<LoadDetalleCompra>(url, this.headers);
  }

  loadDetalleCompraById(id_detalle_compra: any) {
    const url = `${base_url}/detalles-compras/id/${id_detalle_compra}`;
    return this.http.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, detalles_compras: DetalleCompra }) => resp.detalles_compras)
      )
  }
  
  loadDetallesCompraByIdCompra(id_compra: any) {
    const url = `${base_url}/detalles-compras/compra/${id_compra}`;
    return this.http.get<LoadDetalleCompra>(url, this.headers);
  }

  /*loadDetalleCompraByCompra2(id_compra_compra: any) {
    const url = `${base_url}/detalles-compras/compra/${id_compra_compra}`;
    return this.http.get<{ detalles_compras: DetalleCompra[] }>(url, this.headers);
  }
  */

  //createDetalleCompra(formData: FormDetalleCompra) {
  createDetalleCompra(formData: any) {
    const url = `${base_url}/detalles-compras`;
    return this.http.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, detalles_compras: DetalleCompra[] }) => resp.detalles_compras)
      )
  }

  createDetalleCompraArray(detalles: DetalleCompra[]) {
    const url = `${base_url}/detalles-compras`;
    const formData = { detalles }; // Crear un objeto con una propiedad 'detalles' que contenga el arreglo de detalles
    return this.http.post(url, formData, this.headers).pipe(
      map((resp: { ok: boolean; detalles_compras: DetalleCompra[] }) => resp.detalles_compras)
    );
  }

  updateDetalleCompra(detalles_compras: DetalleCompraU) {
    const url = `${base_url}/detalles-compras/${detalles_compras.id_detalle_compra}`;
    return this.http.put(url, detalles_compras, this.headers);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  // Validación de token 
  validarToken(): Observable<boolean> {
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${base_url}/login/renew`, {
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
    return this.http.post(`${base_url}/login`, fomrLogin)
      .pipe(
        tap((resp: any) => {
          localStorage.setItem('token', resp.token)
        })
      )
  }

}




