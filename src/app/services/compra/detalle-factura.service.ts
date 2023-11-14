import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
//import { FormDetalleFactura } from 'src/app/interfaces/compra/detalle-factura/form-detalle-asiento.interface';
import { LoadDetalleFactura } from 'src/app/interfaces/compra/detalle-factura/load-detalle-asiento.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { DetalleFactura } from 'src/app/models/compra/detalle-factura.model';
import { DetalleFacturaU } from 'src/app/models/compra/detalle-factura.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class DetalleFacturaService {

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

  loadDetalleFacturas() {
    const url = `${base_url}/detalle-facturas`;
    return this.http.get<LoadDetalleFactura>(url, this.headers);
  }

  loadDetalleFacturaById(id_detalle_factura_compra: any) {
    const url = `${base_url}/detalle-facturas/id/${id_detalle_factura_compra}`;
    return this.http.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, detalle_factura: DetalleFactura }) => resp.detalle_factura)
      )
  }
  
  loadDetallesFacturaByIdFactura(id_factura_compra: any) {
    const url = `${base_url}/detalle-facturas/factura/${id_factura_compra}`;
    return this.http.get<LoadDetalleFactura>(url, this.headers);
  }

  /*loadDetalleFacturaByFactura2(id_factura_compra: any) {
    const url = `${base_url}/detalle-facturas/factura/${id_factura_compra}`;
    return this.http.get<{ detalle_facturas: DetalleFactura[] }>(url, this.headers);
  }
  */

  //createDetalleFactura(formData: FormDetalleFactura) {
  createDetalleFactura(formData: any) {
    const url = `${base_url}/detalle-facturas`;
    return this.http.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, detalle_factura: DetalleFactura[] }) => resp.detalle_factura)
      )
  }

  createDetalleFacturaArray(detalles: DetalleFactura[]) {
    const url = `${base_url}/detalle-facturas`;
    const formData = { detalles }; // Crear un objeto con una propiedad 'detalles' que contenga el arreglo de detalles
    return this.http.post(url, formData, this.headers).pipe(
      map((resp: { ok: boolean; detalle_factura: DetalleFactura[] }) => resp.detalle_factura)
    );
  }

  updateDetalleFactura(detalle_factura: DetalleFacturaU) {
    const url = `${base_url}/detalle-facturas/${detalle_factura.id_detalle_factura_compra}`;
    return this.http.put(url, detalle_factura, this.headers);
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




