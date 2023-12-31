import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
import { LoadPago } from '../../interfaces/contabilidad/pago/load-pago.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { Pago } from '../../models/contabilidad/pago.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})

export class PagoService {

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

  loadPagos(desde: number = 0, limit: number = 0) {
    const url = `${base_url}/contabilidad/pagos?desde=${desde}&limit=${limit}`;
    return this.http.get<LoadPago>(url, this.headers);
  }

  loadPagosAll() {
    const url = `${base_url}/contabilidad/pagos/all`;
    return this.http.get<LoadPago>(url, this.headers);
  }

  loadPagosByIdCompra(id_compra: any) {
    const url = `${base_url}/contabilidad/pagos/compra/${id_compra}`;
    return this.http.get<LoadPago>(url, this.headers);
  }

  loadPagosByIdVenta(id_compra: any) {
    const url = `${base_url}/contabilidad/pagos/venta/${id_compra}`;
    return this.http.get<LoadPago>(url, this.headers);
  }

  loadPagoById(id_pago: any) {
    const url = `${base_url}/contabilidad/pagos/id/${id_pago}`;
    return this.http.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, pago: Pago }) => resp.pago)
      )
  }

  createPago(formData: any) {
    const url = `${base_url}/contabilidad/pagos`;
    return this.http.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, pago: Pago[] }) => resp.pago)
      )
  }

  updatePago(pago: Pago) {
    const url = `${base_url}/contabilidad/pagos/${pago.id_pago}`;
    return this.http.put(url, pago, this.headers);
  }

  deletePago(id_pago: any) { //OJO: any
    const url = `${base_url}/contabilidad/pagos/${id_pago}`;
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