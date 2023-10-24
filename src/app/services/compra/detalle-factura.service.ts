import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
import { FormDetalleFactura } from 'src/app/interfaces/compra/detalle-factura/form-detalle-asiento.interface';
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

  loadDetalleFacturas() {
    console.log("XDXDXDXDXD")
    const url = `${base_url}/detalle-facturas`;
    return this.hhtp.get<LoadDetalleFactura>(url, this.headers);
  }

  loadDetalleFacturaById(id_detalle_factura_compra: any) {
    console.log("SERVICE - loadDetalleFacturaById(id_detalle_factura_compra: any) {")
    console.log("id_detalle_factura_compra")
    console.log(id_detalle_factura_compra)
    const url = `${base_url}/detalle-facturas/id/${id_detalle_factura_compra}`;
    return this.hhtp.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, detalle_factura: DetalleFactura }) => resp.detalle_factura)
      )
  }
  loadDetalleFacturaByFactura(id_factura_compra: any) {
    console.log("id_factura_compra")
    console.log(id_factura_compra)
    const url = `${base_url}/detalle-facturas/factura/${id_factura_compra}`;
    return this.hhtp.get<LoadDetalleFactura>(url, this.headers);
  }

  loadDetalleFacturaByFactura2(id_factura_compra: any) {
    const url = `${base_url}/detalle-facturas/factura/${id_factura_compra}`;
    return this.hhtp.get<{ detalle_facturas: DetalleFactura[] }>(url, this.headers);
  }

  createDetalleFactura(formData: FormDetalleFactura) {
    const url = `${base_url}/detalle-facturas`;
    console.log(url)
    console.log("formData")
    console.log(formData)
    console.log("formData.referencia")
    console.log(formData.referencia)

    return this.hhtp.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, detalle_factura: DetalleFactura[] }) => resp.detalle_factura)
      )
  }


  createDetalleFactura2(detalles: DetalleFactura[]) {
    const url = `${base_url}/detalle-facturas`;
    console.log(url);
    console.log("SERVICE createDetalleFactura2");
    console.log('detalles');
    console.log(detalles);

    const formData = { detalles }; // Crear un objeto con una propiedad 'detalles' que contenga el arreglo de detalles

    console.log('FORMDATA');
    console.log(formData);

    return this.hhtp.post(url, formData, this.headers).pipe(
      map((resp: { ok: boolean; detalle_factura: DetalleFactura[] }) => resp.detalle_factura)
    );
  }



  updateDetalleFactura(detalle_factura: DetalleFacturaU) {
    console.log("detalle_factura.id_detalle_factura_compra")
    console.log(detalle_factura.id_detalle_factura_compra)
    //const url = `${base_url}/detalle-facturas/3`;
    const url = `${base_url}/detalle-facturas/${detalle_factura.id_detalle_factura_compra}`;
    console.log("Service - URL")
    console.log(url)
    return this.hhtp.put(url, detalle_factura, this.headers);
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




