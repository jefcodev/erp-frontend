import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, catchError, of } from 'rxjs';

// Interfaces
//import { FormVenta } from 'src/app/interfaces/venta/venta/form-venta.interface';
import { LoadVenta } from 'src/app/interfaces/venta/venta/load-venta.interface';
import { LoginForm } from '../../interfaces/login-form.iterface';

// Models
import { Venta } from 'src/app/models/venta/venta.model';
//import { DetalleVenta } from 'src/app/models/venta/detalle-venta.model';

// Variable API
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class VentaService {

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

  loadVentas(desde: number = 0, limit: number = 0) {
    const url = `${base_url}/ventas?desde=${desde}&limit=${limit}`;
    return this.http.get<LoadVenta>(url, this.headers);
  }

  loadVentasAll() {
    const url = `${base_url}/ventas/all`;
    return this.http.get<LoadVenta>(url, this.headers);
  }

  loadVentaById(id_venta_venta: any) {
    const url = `${base_url}/ventas/${id_venta_venta}`;
    return this.http.get(url, this.headers).pipe(
      map((resp: { ok: boolean, venta: Venta, saldo: number, observacion: string }) => {
        return { venta: resp.venta, saldo: resp.saldo };
      })
    );
  }

  createVenta(formData: any) {
    const url = `${base_url}/ventas`;
    return this.http.post(url, formData, this.headers)
      .pipe(
        map((resp: { ok: boolean, venta: Venta[] }) => resp.venta)
      )
  }

  updateVenta(venta: Venta) {
    const url = `${base_url}/ventas/${venta.id_venta}`;
    return this.http.put(url, venta, this.headers);
  }

  deleteVenta(id_venta_venta: any) { //OJO: any
    const url = `${base_url}/ventas/${id_venta_venta}`;
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




