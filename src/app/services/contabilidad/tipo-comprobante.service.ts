import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
import { LoadTipoComprobante } from '../../interfaces/contabilidad/tipo-comprobante/load-tipo-comprobante.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { TipoComprobante } from '../../models/contabilidad/tipo-comprobante.model';

// Variable API
const base_url = environment.base_url;


@Injectable({
  providedIn: 'root'
})
export class TipoComprobanteService {

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

  loadTiposComprobantes(desde: number = 0, limit: number = 0) {
    const url = `${base_url}/contabilidad/tipos-comprobantes?desde=${desde}&limit=${limit}`;
    return this.http.get<LoadTipoComprobante>(url, this.headers);
  }


  loadTiposComprobantesAll() {
    const url = `${base_url}/contabilidad/tipos-comprobantes/all`;
    return this.http.get<LoadTipoComprobante>(url, this.headers);
  }

  loadTipoComprobanteByIdCompra(id_compra: any) {
    const url = `${base_url}/contabilidad/tipos-comprobantes/compra/${id_compra}`;
    return this.http.get<LoadTipoComprobante>(url, this.headers);
  }

  loadTipoComprobanteByIdVenta(id_compra: any) {
    const url = `${base_url}/contabilidad/tipos-comprobantes/venta/${id_compra}`;
    return this.http.get<LoadTipoComprobante>(url, this.headers);
  }

  loadTipoComprobanteById(id_tipo_comprobante: any) {
    const url = `${base_url}/contabilidad/tipos-comprobantes/id/${id_tipo_comprobante}`;
    return this.http.get(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, tipoComprobante: TipoComprobante }) => resp.tipoComprobante)
      )
  }

  createTipoComprobante(formData: any) {
    const url = `${base_url}/contabilidad/tipos-comprobantes`;
    return this.http.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, tipoComprobante: TipoComprobante[] }) => resp.tipoComprobante)
      )
  }

  updateTipoComprobante(tipoComprobante: TipoComprobante) {
    const url = `${base_url}/contabilidad/tipos-comprobantes/${tipoComprobante.id_tipo_comprobante}`;
    return this.http.put(url, tipoComprobante, this.headers);
  }

  deleteTipoComprobante(id_tipo_comprobante: any) { //OJO: any
    const url = `${base_url}/contabilidad/tipos-comprobantes/${id_tipo_comprobante}`;
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
