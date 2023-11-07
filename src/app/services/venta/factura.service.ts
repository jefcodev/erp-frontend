import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
//import { FormFactura } from 'src/app/interfaces/venta/factura/form-factura.interface';
import { LoadFactura } from 'src/app/interfaces/venta/factura/load-factura.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { Factura } from 'src/app/models/venta/factura.model';
//import { DetalleFactura } from 'src/app/models/venta/detalle-factura.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class FacturaService {

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

  loadFacturas(desde: number = 0, limit: number = 0) {
    const url = `${base_url}/facturas-venta?desde=${desde}&limit=${limit}`;
    return this.http.get<LoadFactura>(url, this.headers);
  }

  loadFacturasAll() {
    const url = `${base_url}/facturas-venta/all`;
    return this.http.get<LoadFactura>(url, this.headers);
  }

  loadFacturaById(id_factura_venta: any) {
    const url = `${base_url}/facturas-venta/${id_factura_venta}`;
    return this.http.get(url, this.headers).pipe(
      map((resp: { ok: boolean, factura: Factura, saldo: number, observacion: string }) => {
        return { factura: resp.factura, saldo: resp.saldo };
      })
    );
  }

  createFactura(formData: any) {
    const url = `${base_url}/facturas-venta`;
    return this.http.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, factura: Factura[] }) => resp.factura)
      )
  }

  updateFactura(factura: Factura) {
    const url = `${base_url}/facturas-venta/${factura.id_factura_venta}`;
    return this.http.put(url, factura, this.headers);
  }

  deleteFactura(id_factura_venta: any) { //OJO: any
    const url = `${base_url}/facturas-venta/${id_factura_venta}`;
    return this.http.delete(url, this.headers);
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




