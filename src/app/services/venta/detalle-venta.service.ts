import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
//import { FormDetalleVenta } from 'src/app/interfaces/venta/detalles-venta/form-detalles-asiento.interface';
import { LoadDetalleVenta } from 'src/app/interfaces/venta/detalle-venta/load-detalle-venta.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { DetalleVenta } from 'src/app/models/venta/detalle-venta.model';
import { DetalleVentaU } from 'src/app/models/venta/detalle-venta.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class DetalleVentaService {

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

  loadDetalleVentas() {
    const url = `${base_url}/detalles-ventas`;
    return this.http.get<LoadDetalleVenta>(url, this.headers);
  }

  loadDetalleVentaById(id_detalle_venta: any) {
    const url = `${base_url}/detalles-ventas/id/${id_detalle_venta}`;
    return this.http.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, detalles_ventas: DetalleVenta }) => resp.detalles_ventas)
      )
  }
  loadDetallesVentaByIdVenta(id_venta_venta: any) {
    const url = `${base_url}/detalles-ventas/venta/${id_venta_venta}`;
    return this.http.get<LoadDetalleVenta>(url, this.headers);
  }

  /*loadDetalleVentaByVenta2(id_venta_venta: any) {
    const url = `${base_url}/detalles-ventas/venta/${id_venta_venta}`;
    return this.http.get<{ detalles_ventass: DetalleVenta[] }>(url, this.headers);
  }
  */

  //createDetalleVenta(formData: FormDetalleVenta) {
  createDetalleVenta(formData: any) {
    const url = `${base_url}/detalles-ventas`;
    return this.http.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, detalles_ventas: DetalleVenta[] }) => resp.detalles_ventas)
      )
  }

  createDetalleVentaArray(detalles: DetalleVenta[]) {
    const url = `${base_url}/detalles-ventas`;
    const formData = { detalles }; // Crear un objeto con una propiedad 'detalles' que contenga el arreglo de detalles
    return this.http.post(url, formData, this.headers).pipe(
      map((resp: { ok: boolean; detalles_ventas: DetalleVenta[] }) => resp.detalles_ventas)
    );
  }

  updateDetalleVenta(detalles_ventas: DetalleVentaU) {
    const url = `${base_url}/detalles-ventas/${detalles_ventas.id_detalle_venta}`;
    return this.http.put(url, detalles_ventas, this.headers);
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